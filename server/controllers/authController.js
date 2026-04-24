import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SECRET = process.env.JWT_SECRET;
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

const generateToken = (user) => {
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

export const register = asyncHandler(async (req, res) => {
    const { username, email, password, profilePicture } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new AppError(400, 'User already exists!');
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        throw new AppError(400, 'Username is already taken!');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hashPassword,
        profilePicture,
    });

    const token = generateToken(user);
    res.json(buildUserResponse(user, token));
});

export const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    const isEmail = identifier.includes('@');
    const user = isEmail
        ? await User.findOne({ email: identifier })
        : await User.findOne({ username: identifier });

    if (!user) {
        throw new AppError(403, 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new AppError(403, 'Invalid credentials');
    }

    const token = generateToken(user);
    res.json(buildUserResponse(user, token));
});

export const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) throw new AppError(404, 'User not found');
    res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { username, email, profilePicture, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    if (username && username !== user.username) {
        if (isUsernameLocked(user.usernameChangedAt)) {
            const days = daysUntilUnlock(user.usernameChangedAt);
            throw new AppError(400, `You can change your username again in ${days} day${days === 1 ? '' : 's'}.`);
        }
        const taken = await User.findOne({ username, _id: { $ne: userId } });
        if (taken) {
            throw new AppError(400, 'Username is already taken!');
        }
        user.username = username;
        user.usernameChangedAt = new Date();
    }

    if (email && email !== user.email) {
        const taken = await User.findOne({ email, _id: { $ne: userId } });
        if (taken) {
            throw new AppError(400, 'Email is already in use!');
        }
        user.email = email;
    }

    if (profilePicture !== undefined) {
        user.profilePicture = profilePicture;
    }

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const token = generateToken(user);
    res.json(buildUserResponse(user, token));
});
