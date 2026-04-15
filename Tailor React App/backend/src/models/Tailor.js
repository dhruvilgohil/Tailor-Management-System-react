const mongoose = require('mongoose');

const TailorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    employmentType: { type: String, enum: ['Salary', 'Contract'], default: 'Salary' },
}, { timestamps: true });

module.exports = mongoose.model('Tailor', TailorSchema);
