


const User = require('../models/userModel');
const Product = require('../models/productModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Token yaratmaq üçün köməkçi funksiya
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gizli_acar_123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      lastName,
      email,
      phone,
      address,
      password,
      confirmPassword,
      termsAccepted,
    } = req.body;

    if (![name, lastName, email, phone, address].every(
      (value) => typeof value === 'string' && value.trim()
    ) || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Bütün profil sahələri doldurulmalıdır.' });
    }

    if (address.trim().length > 500) {
      return res.status(400).json({ message: 'Ünvan 500 simvoldan çox ola bilməz.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Şifrələr uyğun gəlmir.' });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({ message: 'İstifadə şərtlərini qəbul etməlisiniz.' });
    }

    // İstifadəçi artıq mövcuddurmu?
    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'Bu istifadəçi artıq mövcuddur.' });
    }

    // Yeni istifadəçi yarat
    const user = await User.create({
      name,
      lastName,
      email: normalizedEmail,
      phone,
      address: address.trim(),
      termsAccepted,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        termsAccepted: user.termsAccepted,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'İstifadəçi məlumatları yanlışdır.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Qeydiyyat zamanı daxili xəta baş verdi.' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // İstifadəçini email ilə tap
    const user = await User.findOne({ email });

    // İstifadəçi varsa və şifrə uyğundursa
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address || '',
        termsAccepted: user.termsAccepted,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'E-poçt ünvanı və ya şifrə yanlışdır.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Daxil olarkən daxili xəta baş verdi.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // req.user, authMiddleware-dən gəlir
    if (req.user) {
      res.json({
        _id: req.user._id,
        name: req.user.name,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address || '',
        termsAccepted: req.user.termsAccepted,
        role: req.user.role,
      });
    } else {
      res.status(404).json({ message: 'İstifadəçi tapılmadı.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Profil məlumatları yüklənərkən xəta baş verdi.' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, lastName, email, phone, address } = req.body;

    if (![name, lastName, email, phone].every(
      (value) => typeof value === 'string' && value.trim()
    )) {
      return res.status(400).json({ message: 'Bütün profil sahələri doldurulmalıdır.' });
    }

    if (address !== undefined && (
      typeof address !== 'string' || address.trim().length > 500
    )) {
      return res.status(400).json({ message: 'Ünvan 500 simvoldan çox ola bilməz.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailExists = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });
    if (emailExists) {
      return res.status(400).json({ message: 'Bu e-poçt ünvanı artıq istifadə olunur.' });
    }

    req.user.name = name.trim();
    req.user.lastName = lastName.trim();
    req.user.email = normalizedEmail;
    req.user.phone = phone.trim();
    if (address !== undefined) {
      req.user.address = address.trim();
    }
    const user = await req.user.save();

    res.json({
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address || '',
      termsAccepted: user.termsAccepted,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Profil yenilənərkən daxili xəta baş verdi.' });
  }
};

const getFavorites = async (req, res) => {
  try {
    await req.user.populate('favorites');
    res.json(req.user.favorites.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: 'Sevimlilər yüklənərkən xəta baş verdi.' });
  }
};

const setFavorite = async (req, res) => {
  const { productId } = req.params;
  const { isFavorite } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Məhsul identifikatoru yanlışdır.' });
  }

  if (typeof isFavorite !== 'boolean') {
    return res.status(400).json({ message: 'Sevimli statusu düzgün göstərilməyib.' });
  }

  try {
    if (isFavorite && !(await Product.exists({ _id: productId }))) {
      return res.status(404).json({ message: 'Məhsul tapılmadı.' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      [isFavorite ? '$addToSet' : '$pull']: { favorites: productId },
    });

    res.json({ productId, isFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Sevimli məhsul yenilənərkən xəta baş verdi.' });
  }
};

// Funksiyaları export edirik
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getFavorites,
  setFavorite,
};