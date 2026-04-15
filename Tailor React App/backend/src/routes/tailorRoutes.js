const express = require('express');
const router = express.Router();
const { getTailors, addTailor, updateTailor, deleteTailor } = require('../controllers/tailorController');

router.route('/')
    .get(getTailors)
    .post(addTailor);

router.route('/:id')
    .put(updateTailor)
    .delete(deleteTailor);

module.exports = router;
