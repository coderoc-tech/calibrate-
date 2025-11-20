const router = require('express').Router();
const User = require('../models/User');
const verify = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET ALL USERS (Admin and Manager can view)
router.get('/', verify, async (req, res) => {
    try {
        // Check if user is Admin or Manager
        if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE USER (Admin only)
router.post('/', verify, async (req, res) => {
    try {
        console.log('Create user request:', { username: req.body.username, email: req.body.email, role: req.body.role });
        console.log('Requesting user:', req.user);

        // Check if user is Admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only admins can create users' });
        }

        // Validate required fields
        if (!req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || 'User'
        });

        const newUser = await user.save();
        const { password, ...userWithoutPassword } = newUser.toObject();
        console.log('User created successfully:', userWithoutPassword);
        res.status(201).json(userWithoutPassword);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(400).json({ message: err.message });
    }
});

// UPDATE USER (Admin only)
router.put('/:id', verify, async (req, res) => {
    try {
        // Check if user is Admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only admins can update users' });
        }

        const updateData = {
            username: req.body.username,
            email: req.body.email,
            role: req.body.role
        };

        // If password is being updated, hash it
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE USER (Admin only)
router.delete('/:id', verify, async (req, res) => {
    try {
        // Check if user is Admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only admins can delete users' });
        }

        // Prevent deleting yourself
        if (req.params.id === req.user._id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
