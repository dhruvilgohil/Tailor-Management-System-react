const express = require('express');
const router = express.Router();
const { getMeasurements, saveMeasurement } = require('../controllers/measurementController');

router.route('/')
    .get(getMeasurements)
    .post(saveMeasurement);

module.exports = router;
