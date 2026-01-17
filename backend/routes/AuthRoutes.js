const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController. verifyOTP);
router.post('/resend-otp', authController.resendOTP);

module.exports = router;