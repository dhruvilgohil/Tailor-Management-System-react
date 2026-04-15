const IncomeTransaction = require('../models/IncomeTransaction');
const { syncIncomeForAllEligibleOrders } = require('../services/incomeSyncService');

// @route   GET /api/income
const getIncomeTransactions = async (req, res) => {
    try {
        await syncIncomeForAllEligibleOrders();
        const transactions = await IncomeTransaction.find({}).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/income
const addIncomeTransaction = async (req, res) => {
    try {
        const transaction = await IncomeTransaction.create(req.body);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   PUT /api/income/:id
const updateIncomeTransaction = async (req, res) => {
    try {
        const transaction = await IncomeTransaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   DELETE /api/income/:id
const deleteIncomeTransaction = async (req, res) => {
    try {
        const transaction = await IncomeTransaction.findByIdAndDelete(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getIncomeTransactions, addIncomeTransaction, updateIncomeTransaction, deleteIncomeTransaction };
