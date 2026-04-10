const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    dressType: { type: String, required: true },
    measurementDate: { type: Date, required: true },
    shirt: {
        length: String, shoulder: String, sleeveLength: String, halfSleeveLength: String, halfSleeveFitting: String, chest: String, stomach: String, sideChest: String, sideStomach: String, sideSeat: String
    },
    pant: {
        length: String, waist: String, seat: String, thigh: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Measurement', MeasurementSchema);
