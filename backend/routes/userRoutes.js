const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getUsers, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
