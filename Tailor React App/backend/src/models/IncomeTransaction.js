const mongoose = require('mongoose');

const IncomeTransactionSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', sparse: true },
    source: { type: String, enum: ['manual', 'order-completion'], default: 'manual' },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Online'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('IncomeTransaction', IncomeTransactionSchema);
