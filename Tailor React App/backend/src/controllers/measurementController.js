const Measurement = require('../models/Measurement');

// @route   GET /api/measurements
const getMeasurements = async (req, res) => {
    try {
        const measurements = await Measurement.find({}).populate('customerId', 'name contact');
        res.json(measurements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/measurements
const saveMeasurement = async (req, res) => {
    try {
        const measurement = await Measurement.create(req.body);
        const populatedMeasurement = await Measurement.findById(measurement._id).populate('customerId', 'name contact');
        res.status(201).json(populatedMeasurement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   PUT /api/measurements/:id
const updateMeasurement = async (req, res) => {
    try {
        const measurement = await Measurement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!measurement) return res.status(404).json({ message: 'Measurement not found' });
        const populated = await Measurement.findById(measurement._id).populate('customerId', 'name contact');
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @route   DELETE /api/measurements/:id
const deleteMeasurement = async (req, res) => {
    try {
        const measurement = await Measurement.findByIdAndDelete(req.params.id);
        if (!measurement) return res.status(404).json({ message: 'Measurement not found' });
        res.json({ message: 'Measurement removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMeasurements, saveMeasurement, updateMeasurement, deleteMeasurement };
