const Tailor = require('../models/Tailor');

// GET /api/tailors
const getTailors = async (req, res) => {
    try {
        const tailors = await Tailor.find({});
        res.json(tailors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/tailors
const addTailor = async (req, res) => {
    try {
        const tailor = await Tailor.create(req.body);
        res.status(201).json(tailor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/tailors/:id
const updateTailor = async (req, res) => {
    try {
        const tailor = await Tailor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!tailor) return res.status(404).json({ message: 'Tailor not found' });
        res.json(tailor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE /api/tailors/:id
const deleteTailor = async (req, res) => {
    try {
        const tailor = await Tailor.findByIdAndDelete(req.params.id);
        if (!tailor) return res.status(404).json({ message: 'Tailor not found' });
        res.json({ message: 'Tailor removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTailors, addTailor, updateTailor, deleteTailor };
