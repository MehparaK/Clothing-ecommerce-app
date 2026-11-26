const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getFavorites,
  setFavorite,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Middleware-i import etdik

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile); // Yeni route
router.put('/me', protect, updateUserProfile);
router.get('/favorites', protect, getFavorites);
router.put('/favorites/:productId', protect, setFavorite);

module.exports = router;