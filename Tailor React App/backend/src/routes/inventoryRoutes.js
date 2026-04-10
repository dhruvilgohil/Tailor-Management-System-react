const express = require('express');
const router = express.Router();
const { getInventoryItems, addInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');

router.route('/')
    .get(getInventoryItems)
    .post(addInventoryItem);

router.route('/:id')
    .delete(deleteInventoryItem);

module.exports = router;
