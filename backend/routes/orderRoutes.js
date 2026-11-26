const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus,
  confirmDelivery,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, admin, getOrders);
router.patch('/:id/status', protect, admin, updateOrderStatus);
router.patch('/:id/confirm-delivery', protect, confirmDelivery);

module.exports = router;
