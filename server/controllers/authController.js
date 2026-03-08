import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const SECRET = process.env.JWT_SECRET;
        const { username, email, password, confirmPassword, profilePicture } = req.body;

        if (!username || username.trim().length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long!' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match!' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        const existingUsername = await User.findOne({ username: username.trim() });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken!' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username: username.trim(),
            email,
            password: hashPassword,
            profilePicture,
        });

        const payload = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
        };

        const token = jwt.sign(payload, SECRET, { expiresIn: '2d' });

        res.json({
            accessToken: token,
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const SECRET = process.env.JWT_SECRET;
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(403).json({ message: "Invalid email or password" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(403).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
            SECRET,
            { expiresIn: '2d' }
        );

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            accessToken: token,
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, email, profilePicture, password, confirmPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username && username.trim() !== user.username) {
            const existingUsername = await User.findOne({ username: username.trim() });
            if (existingUsername) {
                return res.status(400).json({ message: "Username is already taken!" });
            }
            user.username = username.trim();
        }

        if (email) user.email = email;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        if (password) {
            if (password.length < 4) {
                return res.status(400).json({ message: "Password must be at least 4 characters long!" });
            }
            if (password !== confirmPassword) {
                return res.status(400).json({ message: "Passwords do not match!" });
            }
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            accessToken: req.headers['x-authorization'],
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: "User not found" });
    }
};