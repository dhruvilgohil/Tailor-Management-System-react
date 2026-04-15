const mongoose = require('mongoose');

const ItemUsedSchema = new mongoose.Schema({
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    quantity: { type: Number, default: 1 },
    calculatedPrice: { type: Number, default: 0 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    customerId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    measurementId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement' },
    services:            { type: [String], default: [] },
    itemsUsed:           { type: [ItemUsedSchema], default: [] },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    assignedTailor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor' },
    tailorContractPrice: { type: Number, default: 0 },
    paymentMethod:       { type: String, enum: ['Cash', 'Online', 'Pending'], default: 'Cash' },
    paymentExpectedBy:   { type: Date },
    calculatedTotal:     { type: Number, default: 0 },
    userDefinedTotal:    { type: Number, default: 0 },
    targetDeliveryDate:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
