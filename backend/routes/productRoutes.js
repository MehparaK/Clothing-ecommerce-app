const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');


const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();


router.route('/').get(getProducts);
router.route('/:id').get(getProductById);


router.route('/').post(protect, admin, createProduct);
router.route('/:id').put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

module.exports = router;