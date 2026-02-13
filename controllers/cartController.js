const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ErrorHandler } = require('../middleware/errorMiddleware');

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return next(new ErrorHandler('Not enough stock available', 400));
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user._id,
        products: [
          {
            product: productId,
            quantity,
            price: product.price,
          },
        ],
      });
    } else {
      // Check if product already in cart
      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
      );

      if (productIndex > -1) {
        // Update quantity
        cart.products[productIndex].quantity += quantity;
        
        // Check stock
        if (cart.products[productIndex].quantity > product.stock) {
          return next(new ErrorHandler('Not enough stock available', 400));
        }
      } else {
        // Add new product
        cart.products.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }
    }

    await cart.save();

    // Populate product details
    cart = await Cart.findOne({ user: req.user._id }).populate(
      'products.product',
      'name image price stock'
    );

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== req.params.productId
    );

    await cart.save();

    // Populate product details
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      'products.product',
      'name image price stock'
    );

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return next(new ErrorHandler('Quantity must be at least 1', 400));
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === req.params.productId
    );

    if (productIndex === -1) {
      return next(new ErrorHandler('Product not found in cart', 404));
    }

    // Check stock
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    if (quantity > product.stock) {
      return next(new ErrorHandler('Not enough stock available', 400));
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    // Populate product details
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      'products.product',
      'name image price stock'
    );

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'products.product',
      'name image price stock category'
    );

    if (!cart) {
      // Create empty cart if not exists
      cart = new Cart({
        user: req.user._id,
        products: [],
        totalPrice: 0,
      });
      await cart.save();
      cart = await Cart.findOne({ user: req.user._id }).populate(
        'products.product',
        'name image price stock category'
      );
    }

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  clearCart,
};
