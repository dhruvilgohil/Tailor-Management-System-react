const express = require('express');
const router = express.Router();
const { getIncomeTransactions, addIncomeTransaction, updateIncomeTransaction, deleteIncomeTransaction } = require('../controllers/incomeController');

router.route('/')
    .get(getIncomeTransactions)
    .post(addIncomeTransaction);

router.route('/:id')
    .put(updateIncomeTransaction)
    .delete(deleteIncomeTransaction);

module.exports = router;
