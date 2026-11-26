const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
const ORDER_STATUSES = ['pending', 'confirmed', 'in_delivery', 'completed', 'cancelled'];
const LEGACY_STATUS_MAP = { shipped: 'in_delivery', delivered: 'completed' };

const serializeOrder = (order) => {
  const serializedOrder = order.toObject();
  serializedOrder.status = LEGACY_STATUS_MAP[serializedOrder.status] || serializedOrder.status;
  return serializedOrder;
};

const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (typeof deliveryAddress !== 'string' || !deliveryAddress.trim()) {
      return res.status(400).json({ message: 'Çatdırılma ünvanı tələb olunur.' });
    }

    if (deliveryAddress.trim().length > 500) {
      return res.status(400).json({ message: 'Çatdırılma ünvanı 500 simvoldan çox ola bilməz.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Sifarişə ən azı bir məhsul əlavə edin.' });
    }

    let calculatedTotal = 0;
    const productsById = new Map();

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: 'Məhsul tapılmadı.' });
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ message: 'Məhsul sayı düzgün deyil.' });
      }

      const availableSizes = product.sizes?.length ? product.sizes : DEFAULT_SIZES;
      if (!availableSizes.includes(item.selectedSize)) {
        return res.status(400).json({ message: 'Seçilmiş ölçü bu məhsul üçün mövcud deyil.' });
      }

      const productId = product._id.toString();
      const currentEntry = productsById.get(productId);
      productsById.set(productId, {
        product,
        quantity: (currentEntry?.quantity ?? 0) + item.quantity,
      });

      calculatedTotal += product.price * item.quantity;
    }

    for (const { product, quantity } of productsById.values()) {
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `${product.name} üçün kifayət qədər stok yoxdur.`,
        });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items: items.map(({ product, quantity, selectedSize }) => ({
        product,
        quantity,
        selectedSize,
      })),
      total: calculatedTotal,
      deliveryAddress: deliveryAddress.trim(),
    });

    for (const { product, quantity } of productsById.values()) {
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -quantity },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Sifariş yaradılarkən xəta baş verdi.' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders.map(serializeOrder));
  } catch (error) {
    res.status(500).json({ message: 'Sifarişlər yüklənərkən xəta baş verdi.' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders.map(serializeOrder));
  } catch (error) {
    res.status(500).json({ message: 'Sifarişlər yüklənərkən xəta baş verdi.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Düzgün status seçilməlidir.' });
    }

    const filter = { _id: req.params.id };
    if (status !== 'completed') {
      filter.$or = [{ closedAt: { $exists: false } }, { closedAt: null }];
    }

    const order = await Order.findOneAndUpdate(
      filter,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('items.product', 'name price image');

    if (!order && !(await Order.exists({ _id: req.params.id }))) {
      return res.status(404).json({ message: 'Sifariş tapılmadı.' });
    }

    if (!order) {
      return res.status(400).json({ message: 'Bağlanmış sifarişin statusunu dəyişmək mümkün deyil.' });
    }

    res.json(serializeOrder(order));
  } catch (error) {
    res.status(500).json({ message: 'Sifariş statusu yenilənərkən xəta baş verdi.' });
  }
};

const confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: { $in: ['in_delivery', 'shipped'] },
      },
      { $set: { status: 'completed', closedAt: new Date() } },
      { new: true, runValidators: true }
    );

    if (!order) {
      const ownedOrder = await Order.findOne({ _id: req.params.id, user: req.user._id });
      if (!ownedOrder) {
        return res.status(404).json({ message: 'Sifariş tapılmadı.' });
      }
      return res.status(400).json({ message: 'Bu sifariş çatdırılmanı təsdiqləmək üçün hazır deyil.' });
    }

    res.json(serializeOrder(order));
  } catch (error) {
    res.status(500).json({ message: 'Çatdırılma təsdiqlənərkən xəta baş verdi.' });
  }
};

module.exports = { createOrder, getOrders, getMyOrders, updateOrderStatus, confirmDelivery };
