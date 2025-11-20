const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// REGISTER
router.post('/register', async (req, res) => {
    // Validate data (basic validation)
    if (!req.body.username || !req.body.email || !req.body.password) {
        return res.status(400).send('Missing required fields');
    }

    // Check if user exists
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exists');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role || 'User'
    });

    try {
        const savedUser = await user.save();
        res.send({ user: savedUser._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email is not found');

    // Check password
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');

    // Create and assign token
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.header('auth-token', token).send({ token, user: { id: user._id, username: user.username, role: user.role } });
});

module.exports = router;
