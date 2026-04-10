const express = require('express');
const router = express.Router();
const { getIncomeTransactions, addIncomeTransaction } = require('../controllers/incomeController');

router.route('/')
    .get(getIncomeTransactions)
    .post(addIncomeTransaction);

module.exports = router;
