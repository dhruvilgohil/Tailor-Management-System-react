const InventoryItem = require('../models/InventoryItem');

// @route   GET /api/inventory
const getInventoryItems = async (req, res) => {
    try {
        const items = await InventoryItem.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/inventory
const addInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   PUT /api/inventory/:id
const updateInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   DELETE /api/inventory/:id
const deleteInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem };
