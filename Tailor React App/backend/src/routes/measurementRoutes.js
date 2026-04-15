const express = require('express');
const router = express.Router();
const { getMeasurements, saveMeasurement, updateMeasurement, deleteMeasurement } = require('../controllers/measurementController');

router.route('/')
    .get(getMeasurements)
    .post(saveMeasurement);

router.route('/:id')
    .put(updateMeasurement)
    .delete(deleteMeasurement);

module.exports = router;
