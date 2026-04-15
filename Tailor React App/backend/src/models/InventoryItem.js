const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    category: { type: String, enum: ['Fabric', 'Material', 'Febric'], required: true },
    stockQty: { type: Number, default: 0 },
    stockUnit: { type: String, default: 'Meters' },
    unitPrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
