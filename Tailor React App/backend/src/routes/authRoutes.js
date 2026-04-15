const express = require('express');
const { registerUser, loginUser, loginWithGoogle } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', loginWithGoogle);

module.exports = router;
