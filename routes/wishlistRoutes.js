const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
  checkProductInWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/check/:productId', protect, checkProductInWishlist);

// Protected routes
router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.delete('/', protect, clearWishlist);
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
