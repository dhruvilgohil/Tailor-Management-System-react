const express = require('express');
const { getCustomers, addCustomer, deleteCustomer } = require('../controllers/customerController');

const router = express.Router();

router.route('/').get(getCustomers).post(addCustomer);
router.route('/:id').delete(deleteCustomer);

module.exports = router;
