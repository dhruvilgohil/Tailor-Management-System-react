const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    services: { type: String, required: true },
    status: {
        type: String,
        enum: ['Start', 'Pending', 'On Working', 'Complete'],
        default: 'Pending'
    },
    assignedTailor: { type: String },
    deliveryDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
