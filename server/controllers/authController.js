import crypto from 'node:crypto';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/sendEmail.js';

const SECRET = process.env.JWT_SECRET;
const USERNAME_COOLDOWN_DAYS = 30;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

let cachedDummyHash = null;
const getDummyHash = async () => {
    if (!cachedDummyHash) {
        cachedDummyHash = await bcrypt.hash('placeholder-not-a-password', BCRYPT_COST);
    }
    return cachedDummyHash;
};

const runDummyCompare = async (password) => {
    await bcrypt.compare(password, await getDummyHash());
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const promoteIfAdminEmail = async (user) => {
    if (!ADMIN_EMAILS.length) return user;
    const isAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase());
    if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.warn(`[admin] promoted ${user.email} via ADMIN_EMAILS`);
    }
    return user;
};

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
            role: user.role,
            tokenVersion: user.tokenVersion ?? 0,
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
    role: user.role,
});

export const register = asyncHandler(async (req, res) => {
    const { username, email, password, profilePicture } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new AppError(400, 'This email can\'t be used. If you already have an account, sign in or reset your password.');
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        throw new AppError(400, 'Username is already taken!');
    }

    const hashPassword = await bcrypt.hash(password, BCRYPT_COST);
    let user = await User.create({
        username,
        email,
        password: hashPassword,
        profilePicture,
    });
    user = await promoteIfAdminEmail(user);

    const token = generateToken(user);
    res.json(buildUserResponse(user, token));
});

export const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier.toLowerCase() } : { username: identifier };
    let user = await User.findOne(query).select('+password +failedLoginAttempts +lockedUntil +tokenVersion');

    if (!user) {
        await runDummyCompare(password);
        throw new AppError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const isLocked = user.lockedUntil && user.lockedUntil.getTime() > Date.now();
    if (isLocked) {
        await runDummyCompare(password);
        throw new AppError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        const attempts = (user.failedLoginAttempts || 0) + 1;
        const update = { failedLoginAttempts: attempts };
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            update.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
            update.failedLoginAttempts = 0;
        }
        await User.updateOne({ _id: user._id }, update);
        throw new AppError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    if (user.failedLoginAttempts || user.lockedUntil) {
        await User.updateOne({ _id: user._id }, { failedLoginAttempts: 0, lockedUntil: null });
    }

    const token = generateToken(user);
    res.json(buildUserResponse(user, token));
});

const hashResetToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex');

const clientBaseUrl = () =>
    (process.env.CLIENT_URL || '').split(',')[0].trim().replace(/\/$/, '');

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const uniformResponse = {
        message: 'If an account exists for that email, a reset link has been sent.',
    };

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.json(uniformResponse);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.deleteMany({ _ownerId: user._id });
    await PasswordResetToken.create({
        _ownerId: user._id,
        tokenHash: hashResetToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${clientBaseUrl()}/reset-password?token=${rawToken}`;
    try {
        await sendEmail({
            to: user.email,
            subject: 'Reset your Bitcoin Learning Hub password',
            text: `Hi ${user.username},\n\nSomeone requested a password reset for your account. If this was you, open the link below within 30 minutes to set a new password:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
            html: `<p>Hi ${user.username},</p><p>Someone requested a password reset for your account. If this was you, click the link below within <strong>30 minutes</strong> to set a new password:</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
        });
    } catch (err) {
        console.error('[email] Failed to send password reset email:', err.message);
    }

    res.json(uniformResponse);
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    const resetDoc = await PasswordResetToken.findOne({
        tokenHash: hashResetToken(token),
        expiresAt: { $gt: new Date() },
    });
    if (!resetDoc) {
        throw new AppError(400, 'This reset link is invalid or has expired. Request a new one.');
    }

    const user = await User.findById(resetDoc._ownerId).select('+tokenVersion');
    if (!user) {
        await PasswordResetToken.deleteMany({ _ownerId: resetDoc._ownerId });
        throw new AppError(400, 'This reset link is invalid or has expired. Request a new one.');
    }

    user.password = await bcrypt.hash(password, BCRYPT_COST);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();
    await PasswordResetToken.deleteMany({ _ownerId: user._id });

    res.json({ message: 'Your password has been reset. You can now sign in.' });
});

export const logout = asyncHandler(async (req, res) => {
    if (req.user?._id) {
        await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    }
    res.json({ message: 'Logged out successfully' });
});

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) throw new AppError(404, 'User not found');
    res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { username, email, profilePicture, password, currentPassword } = req.body;

    const user = await User.findById(userId).select('+password +tokenVersion');
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    const wantsEmailChange = Boolean(email && email !== user.email);
    const wantsPasswordChange = Boolean(password);
    if (wantsEmailChange || wantsPasswordChange) {
        if (!currentPassword) {
            throw new AppError(400, 'Enter your current password to change your email or password.');
        }
        const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentValid) {
            throw new AppError(400, 'Current password is incorrect.');
        }
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
            throw new AppError(400, 'This email can\'t be used for your account.');
        }
        user.email = email;
    }

    if (profilePicture !== undefined) {
        user.profilePicture = profilePicture;
    }

    if (password) {
        user.password = await bcrypt.hash(password, BCRYPT_COST);
        user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    }

    await user.save();

    const token = generateToken(user);
    res.json(buildUserResponse(user, token));
});
