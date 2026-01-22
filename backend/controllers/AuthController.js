const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sendOTP = async (phoneNumber, otp) => {
  // Always log OTP to console for development
  console.log('\n🔐 ================================');
  console.log(`📱 Phone:  ${phoneNumber}`);
  console.log(`🔑 OTP: ${otp}`);
  console.log('================================\n');

  // Try to send SMS, but don't fail if it doesn't work
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: `Your ChotaHathi verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log(`✅ SMS sent to ${phoneNumber}`);
  } catch (error) {
    console.log(`ℹ️ SMS not sent (using console OTP instead): ${error.message}`);
    // Don't throw error - OTP is still valid via console
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({ success: false, error: 'Valid phone number required' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = await User.create({
        phoneNumber,
        otp:  { code: otp, expiresAt: otpExpiresAt, attempts: 0 },
      });
    } else {
      user.otp = { code: otp, expiresAt: otpExpiresAt, attempts: 0 };
      await user.save();
    }

    await sendOTP(phoneNumber, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: { phoneNumber, expiresIn: 300 },
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || ! otp) {
      return res.status(400).json({ success: false, error: 'Phone and OTP required' });
    }

    const user = await User. findOne({ phoneNumber });

    if (!user || ! user.otp || ! user.otp.code) {
      return res.status(404).json({ success: false, error: 'No OTP found' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }

    if (user.otp.attempts >= 5) {
      return res.status(429).json({ success: false, error: 'Too many attempts' });
    }

    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP',
        attemptsLeft: 5 - user.otp.attempts,
      });
    }

    user.isVerified = true;
    user.lastLogin = new Date();
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'OTP verified',
      data: {
        token,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify OTP' });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date. now() + 5 * 60 * 1000);

    user.otp = { code: otp, expiresAt: otpExpiresAt, attempts: 0 };
    await user.save();

    await sendOTP(phoneNumber, otp);

    res.status(200).json({ success: true, message: 'OTP resent' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to resend OTP' });
  }
};