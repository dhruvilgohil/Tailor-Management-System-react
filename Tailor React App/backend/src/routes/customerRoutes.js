const express = require('express');
const { getCustomers, addCustomer, deleteCustomer, updateCustomer } = require('../controllers/customerController');

const router = express.Router();

router.route('/').get(getCustomers).post(addCustomer);
router.route('/:id').delete(deleteCustomer).put(updateCustomer);

module.exports = router;
