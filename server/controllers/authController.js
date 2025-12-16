import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const SECRET = process.env.JWT_SECRET;

        const { email, password, confirmPassword } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const user = await User.create({ email, password });

        const token = jwt.sign({ _id: user._id, email: user.email }, SECRET, { expiresIn: '2d' });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            accessToken: token,
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

        const token = jwt.sign({ _id: user._id, email: user.email }, SECRET, { expiresIn: '2d' });

        res.json({
            _id: user._id,
            email: user.email,
            accessToken: token,
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};