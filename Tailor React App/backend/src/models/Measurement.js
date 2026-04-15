const mongoose = require('mongoose');

const ShirtSchema = new mongoose.Schema({
    length: String, shoulder: String, sleeveLength: String,
    halfSleeveLength: String, halfSleeveFitting: String,
    chest: String, stomach: String, sideChest: String,
    sideStomach: String, sideSeat: String
}, { _id: false });

const PantSchema = new mongoose.Schema({
    length: String, waist: String, seat: String,
    thigh: String, knee: String, bottom: String, jhulo: String
}, { _id: false });

const MeasurementSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    title: { type: String },
    type: { type: String, required: true },       // Dress type: e.g. "Shirt & Pant"
    dressType: { type: String },                   // alias kept for backward compat
    measurements: {
        shirtMeasurements: { type: ShirtSchema, default: {} },
        pantMeasurements:  { type: PantSchema,  default: {} }
    },
    recordedDate: { type: Date },                  // Frontend sends this field
    measurementDate: { type: Date }                // alias kept for backward compat
}, { timestamps: true });

module.exports = mongoose.model('Measurement', MeasurementSchema);

