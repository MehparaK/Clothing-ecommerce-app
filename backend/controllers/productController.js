const Product = require('../models/productModel');
const {
  notifyFavoriteUsersInStock,
  notifyFavoriteUsersPriceDrop,
} = require('../services/restockNotifications');

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

const validateSizes = (sizes) =>
  Array.isArray(sizes) &&
  sizes.length > 0 &&
  sizes.every((size) => AVAILABLE_SIZES.includes(size));

const sortSizes = (sizes) => AVAILABLE_SIZES.filter((size) => sizes.includes(size));

const serializeProduct = (product) => ({
  ...product.toObject(),
  sizes: product.sizes?.length ? product.sizes : DEFAULT_SIZES,
});

const getQueryString = (value) => (typeof value === 'string' ? value.trim() : '');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPrice = (value) => {
  const rawValue = getQueryString(value);
  if (!rawValue) return null;

  const price = Number(rawValue);
  return Number.isFinite(price) && price >= 0 ? price : null;
};

const getProductSort = (value) => {
  const sort = getQueryString(value).toLowerCase().replace(/[-_]/g, '');
  const sorts = {
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    priceasc: { price: 1, _id: 1 },
    pricedesc: { price: -1, _id: -1 },
    nameasc: { name: 1, _id: 1 },
    namedesc: { name: -1, _id: -1 },
  };

  return sorts[sort] || sorts.newest;
};

const getProducts = async (req, res) => {
  try {
    const filter = {};
    const search = getQueryString(req.query.q) || getQueryString(req.query.search);
    const category = getQueryString(req.query.category);
    const size = getQueryString(req.query.size).toUpperCase();
    const minPrice = getPrice(req.query.minPrice);
    const maxPrice = getPrice(req.query.maxPrice);

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search).replace(/\s+/g, '\\s+'), 'i');
      filter.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    if (category) {
      filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    }

    if (AVAILABLE_SIZES.includes(size)) {
      filter.sizes = size;
    }

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    const products = await Product.find(filter).sort(getProductSort(req.query.sort));
    res.json(products.map(serializeProduct));
  } catch (error) {
    res.status(500).json({ message: 'Məhsullar yüklənərkən xəta baş verdi.' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Məhsul tapılmadı.' });
    }

    res.json(serializeProduct(product));
  } catch (error) {
    res.status(500).json({ message: 'Məhsul yüklənərkən xəta baş verdi.' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image, sizes } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: 'Ad, təsvir, qiymət və kateqoriya mütləqdir.',
      });
    }

    const selectedSizes = sizes ?? DEFAULT_SIZES;
    if (!validateSizes(selectedSizes)) {
      return res.status(400).json({ message: 'Ən azı bir düzgün məhsul ölçüsü seçin.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      image: image || '',
      sizes: sortSizes(selectedSizes),
    });

    res.status(201).json(serializeProduct(product));
  } catch (error) {
    res.status(500).json({ message: 'Məhsul yaradılarkən xəta baş verdi.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Məhsul tapılmadı.' });
    }

    const updates = { ...req.body };
    const selectedSizes = updates.sizes ?? product.sizes ?? DEFAULT_SIZES;
    if (!validateSizes(selectedSizes)) {
      return res.status(400).json({ message: 'Ən azı bir düzgün məhsul ölçüsü seçin.' });
    }
    updates.sizes = sortSizes(selectedSizes);

    const wasOutOfStock = !(product.stock > 0);
    const previousPrice = product.price;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    // Məhsul stokda yox idisə və indi stoka düşübsə, onu sevimlilərinə
    // əlavə etmiş istifadəçilərə bildiriş göndər.
    if (wasOutOfStock && updatedProduct && updatedProduct.stock > 0) {
      try {
        await notifyFavoriteUsersInStock(updatedProduct._id);
      } catch (notificationError) {
        console.error('Stok bildirişi yaradıla bilmədi:', notificationError.message);
      }
    }

    // Qiymət aşağı salınıbsa (endirim tətbiq olunubsa), həmin məhsulu
    // sevimlilərinə əlavə etmiş istifadəçilərə bildiriş göndər.
    if (
      updatedProduct &&
      Number.isFinite(previousPrice) &&
      previousPrice > 0 &&
      Number.isFinite(updatedProduct.price) &&
      updatedProduct.price < previousPrice
    ) {
      try {
        await notifyFavoriteUsersPriceDrop(updatedProduct._id, {
          price: updatedProduct.price,
          previousPrice,
        });
      } catch (notificationError) {
        console.error('Endirim bildirişi yaradıla bilmədi:', notificationError.message);
      }
    }

    res.json(serializeProduct(updatedProduct));
  } catch (error) {
    res.status(500).json({ message: 'Məhsul yenilənərkən xəta baş verdi.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Məhsul tapılmadı.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Məhsul uğurla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Məhsul silinərkən xəta baş verdi.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
