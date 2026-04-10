const Order = require('../models/Order');

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (To be implemented)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('customerId', 'name contact');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { customerId, services, status, assignedTailor, deliveryDate } = req.body;

        const order = new Order({
            customerId,
            services,
            status: status || 'Pending',
            assignedTailor,
            deliveryDate
        });

        const createdOrder = await order.save();

        // Populate customer data before returning
        const populatedOrder = await Order.findById(createdOrder._id).populate('customerId', 'name contact');
        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   PUT /api/orders/:id
// @desc    Update order status
// @access  Private
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            const populatedOrder = await Order.findById(updatedOrder._id).populate('customerId', 'name contact');
            res.json(populatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   DELETE /api/orders/:id
// @desc    Delete an order
// @access  Private
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getOrders, createOrder, updateOrderStatus, deleteOrder };
