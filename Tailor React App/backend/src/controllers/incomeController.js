const IncomeTransaction = require('../models/IncomeTransaction');

// @route   GET /api/income
const getIncomeTransactions = async (req, res) => {
    try {
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

module.exports = { getIncomeTransactions, addIncomeTransaction };
