const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { ErrorHandler } = require('../middleware/errorMiddleware');

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        user: req.user._id,
        products: [{ product: productId }],
      });
    } else {
      // Check if product already in wishlist
      const productExists = wishlist.products.some(
        (p) => p.product.toString() === productId
      );

      if (productExists) {
        return next(new ErrorHandler('Product already in wishlist', 400));
      }

      // Add product to wishlist
      wishlist.products.push({ product: productId });
    }

    await wishlist.save();

    // Populate product details
    wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products.product',
      'name image price ratings stock'
    );

    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return next(new ErrorHandler('Wishlist not found', 404));
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== req.params.productId
    );

    await wishlist.save();

    // Populate product details
    const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products.product',
      'name image price ratings stock'
    );

    res.json({
      success: true,
      wishlist: updatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products.product',
      'name image price ratings stock category'
    );

    if (!wishlist) {
      // Create empty wishlist if not exists
      wishlist = new Wishlist({
        user: req.user._id,
        products: [],
      });
      await wishlist.save();
      wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
        'products.product',
        'name image price ratings stock category'
      );
    }

    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return next(new ErrorHandler('Wishlist not found', 404));
    }

    wishlist.products = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkProductInWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.json({
        success: true,
        isInWishlist: false,
      });
    }

    const isInWishlist = wishlist.products.some(
      (p) => p.product.toString() === req.params.productId
    );

    res.json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
  checkProductInWishlist,
};
