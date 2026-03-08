import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const USERNAME_COOLDOWN_DAYS = 30;

const isUsernameLocked = (usernameChangedAt) => {
    if (!usernameChangedAt) return false;
    const daysSinceChange = (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceChange < USERNAME_COOLDOWN_DAYS;
};

const daysUntilUnlock = (usernameChangedAt) => {
    if (!usernameChangedAt) return 0;
    const daysSinceChange = (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil(USERNAME_COOLDOWN_DAYS - daysSinceChange);
};

const generateToken = (user, SECRET) => {
    return jwt.sign(
        {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            usernameChangedAt: user.usernameChangedAt,
        },
        SECRET,
        { expiresIn: '2d' }
    );
};

const buildUserResponse = (user, token) => ({
    accessToken: token,
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    usernameChangedAt: user.usernameChangedAt,
});

export const register = async (req, res) => {
    try {
        const SECRET = process.env.JWT_SECRET;
        const { username, email, password, confirmPassword, profilePicture } = req.body;

        if (!username || username.trim().length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long!' });
        }
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            return res.status(400).json({ message: 'Username can only contain letters and numbers!' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match!' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
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

        const token = generateToken(user, SECRET);
        res.json(buildUserResponse(user, token));

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const SECRET = process.env.JWT_SECRET;
        const { identifier, password } = req.body;

        if (!identifier) {
            return res.status(400).json({ message: "Please enter your email or username!" });
        }

        const isEmail = identifier.includes('@');
        const user = isEmail
            ? await User.findOne({ email: identifier })
            : await User.findOne({ username: identifier });

        if (!user) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user, SECRET);
        res.json(buildUserResponse(user, token));

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

export const updateProfile = async (req, res) => {
    try {
        const SECRET = process.env.JWT_SECRET;
        const userId = req.user._id;
        const { username, email, profilePicture, password, confirmPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username && username.trim() !== user.username) {
            if (isUsernameLocked(user.usernameChangedAt)) {
                const days = daysUntilUnlock(user.usernameChangedAt);
                return res.status(400).json({
                    message: `You can change your username again in ${days} day${days === 1 ? '' : 's'}.`
                });
            }
            if (!/^[a-zA-Z0-9]+$/.test(username)) {
                return res.status(400).json({ message: "Username can only contain letters and numbers!" });
            }
            if (username.trim().length < 3) {
                return res.status(400).json({ message: "Username must be at least 3 characters long!" });
            }

            const existingUsername = await User.findOne({ username: username.trim() });
            if (existingUsername) {
                return res.status(400).json({ message: "Username is already taken!" });
            }

            user.username = username.trim();
            user.usernameChangedAt = new Date();
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

        const freshToken = generateToken(user, SECRET);
        res.json(buildUserResponse(user, freshToken));

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