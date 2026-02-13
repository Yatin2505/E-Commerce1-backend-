const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ErrorHandler } = require('../middleware/errorMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.products.length === 0) {
      return next(new ErrorHandler('Cart is empty', 400));
    }

    // Create order items from cart
    const orderItems = cart.products.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    }));

    // Get product details for order
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate(
      'products.product',
      'name image'
    );

    const orderProducts = populatedCart.products.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      name: item.product.name,
      image: item.product.image,
    }));

    // Create order
    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      totalPrice: cart.totalPrice,
      paymentStatus: paymentMethod === 'card' ? 'pending' : 'pending',
      orderStatus: 'processing',
    });

    // Clear cart after order
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    // Reduce stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Check if order belongs to user or user is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new ErrorHandler('Not authorized', 403));
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Calculate total revenue
    const totalRevenue = orders.reduce((acc, order) => {
      return order.paymentStatus === 'paid' ? acc + order.totalPrice : acc;
    }, 0);

    res.json({
      success: true,
      count: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    order.paymentStatus = paymentStatus;

    if (paymentStatus === 'paid') {
      order.paidAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('Not authorized', 403));
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return next(new ErrorHandler('Order cannot be cancelled', 400));
    }

    order.orderStatus = 'cancelled';

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
};
