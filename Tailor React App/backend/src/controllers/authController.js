const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '166296830142-ntm847ldhagp3phlc4dlt30l13dr4f5f.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
    try {
        const { username, password, fullName, shopName } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            passwordHash,
            fullName,
            shopName
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                shopName: user.shopName,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                shopName: user.shopName,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

const loginWithGoogle = async (req, res) => {
    try {
        const { googleToken } = req.body;
        if (!googleToken) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // Find or create user — use email as the username
        let user = await User.findOne({ username: email });

        if (!user) {
            // Auto-register new Google users with a random password hash
            const randomPassword = Math.random().toString(36).slice(-10) + googleId;
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                username: email,
                passwordHash,
                fullName: name || email,
                shopName: 'My Tailor Shop',
            });
        }

        res.json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            shopName: user.shopName,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Google auth error:', error.message);
        res.status(401).json({ message: 'Invalid Google token. Please try again.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    loginWithGoogle
};

