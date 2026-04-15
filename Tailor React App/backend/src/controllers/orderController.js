const Order = require('../models/Order');
const IncomeTransaction = require('../models/IncomeTransaction');
const { syncIncomeForOrder } = require('../services/incomeSyncService');

const populateOrder = (query) =>
    query
        .populate('customerId', 'name contact')
        .populate('assignedTailor', 'name employmentType phone')
        .populate('measurementId', 'type dressType recordedDate');

// @route   GET /api/orders
const getOrders = async (req, res) => {
    try {
        const orders = await populateOrder(Order.find({}).sort({ createdAt: -1 }));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/orders
const createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        await syncIncomeForOrder(order._id);
        const populated = await populateOrder(Order.findById(order._id));
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   PUT /api/orders/:id
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        await syncIncomeForOrder(order._id);
        const populated = await populateOrder(Order.findById(order._id));
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        await IncomeTransaction.deleteMany({ orderId: req.params.id });
        res.json({ message: 'Order removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getOrders, createOrder, updateOrder, deleteOrder };

