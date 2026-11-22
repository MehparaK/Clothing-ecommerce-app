const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, admin, getOrders);
router.patch('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
