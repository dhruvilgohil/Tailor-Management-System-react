const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    category: { type: String, enum: ['Fabric', 'Material', 'Febric'], required: true },
    stockLevel: { type: String, required: true },
    unitPrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
