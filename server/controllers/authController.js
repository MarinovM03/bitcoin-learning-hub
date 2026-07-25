import crypto from 'node:crypto';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/authEmails.js';
import { cascadeUserDelete } from '../utils/cascadeUserDelete.js';
import { setSessionCookie, clearSessionCookie, sessionExpiresAt } from '../utils/authCookies.js';

const SECRET = process.env.JWT_SECRET;
const USERNAME_COOLDOWN_DAYS = 30;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

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

const adminEmails = () => (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

// ADMIN_EMAILS is a claim, not proof: promotion requires a verified mailbox.
const promoteIfAdminEmail = async (user) => {
    const allowlist = adminEmails();
    if (!allowlist.length || !user.emailVerified) return user;
    const isAdminEmail = allowlist.includes(user.email?.toLowerCase());
    if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.warn(`[admin] promoted ${user.email} via ADMIN_EMAILS`);
    }
    return user;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const issueVerificationEmail = async (user) => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    await EmailVerificationToken.deleteMany({ _ownerId: user._id });
    await EmailVerificationToken.create({
        _ownerId: user._id,
        tokenHash: hashToken(rawToken),
        email: user.email,
        expiresAt: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
    });

    try {
        await sendVerificationEmail({ to: user.email, username: user.username, rawToken });
    } catch (err) {
        console.error('[email] Failed to send verification email:', err.message);
    }
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

// The JWT leaves in an httpOnly cookie only; the body carries just the
// profile the UI renders, so no credential is reachable from JavaScript.
const sendSession = (res, user) => {
    setSessionCookie(res, generateToken(user));
    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        usernameChangedAt: user.usernameChangedAt,
        role: user.role,
        emailVerified: user.emailVerified ?? false,
        expiresAt: sessionExpiresAt(),
    });
};

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
    const user = await User.create({
        username,
        email,
        password: hashPassword,
        profilePicture,
    });

    await issueVerificationEmail(user);

    sendSession(res, user);
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;

    const verifyDoc = await EmailVerificationToken.findOne({
        tokenHash: hashToken(token),
        expiresAt: { $gt: new Date() },
    });
    if (!verifyDoc) {
        throw new AppError(400, 'This confirmation link is invalid or has expired. Request a new one.');
    }

    let user = await User.findById(verifyDoc._ownerId).select('+tokenVersion');
    if (!user || user.email !== verifyDoc.email) {
        await EmailVerificationToken.deleteMany({ _ownerId: verifyDoc._ownerId });
        throw new AppError(400, 'This confirmation link is invalid or has expired. Request a new one.');
    }

    if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
    }
    await EmailVerificationToken.deleteMany({ _ownerId: user._id });
    user = await promoteIfAdminEmail(user);

    sendSession(res, user);
});

export const resendVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    if (user.emailVerified) {
        throw new AppError(400, 'Your email is already confirmed.');
    }

    const latest = await EmailVerificationToken.findOne({ _ownerId: user._id })
        .sort({ createdAt: -1 })
        .select('createdAt');
    if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
        throw new AppError(429, 'We just sent you a link. Check your inbox, then try again in a minute.');
    }

    await issueVerificationEmail(user);

    res.json({ message: 'We sent a fresh confirmation link to your email address.' });
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

    user = await promoteIfAdminEmail(user);

    sendSession(res, user);
});

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
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    try {
        await sendPasswordResetEmail({ to: user.email, username: user.username, rawToken });
    } catch (err) {
        console.error('[email] Failed to send password reset email:', err.message);
    }

    res.json(uniformResponse);
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    const resetDoc = await PasswordResetToken.findOne({
        tokenHash: hashToken(token),
        expiresAt: { $gt: new Date() },
    });
    if (!resetDoc) {
        throw new AppError(400, 'This reset link is invalid or has expired. Request a new one.');
    }

    let user = await User.findById(resetDoc._ownerId).select('+tokenVersion');
    if (!user) {
        await PasswordResetToken.deleteMany({ _ownerId: resetDoc._ownerId });
        throw new AppError(400, 'This reset link is invalid or has expired. Request a new one.');
    }

    user.password = await bcrypt.hash(password, BCRYPT_COST);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.emailVerified = true;
    await user.save();
    await Promise.all([
        PasswordResetToken.deleteMany({ _ownerId: user._id }),
        EmailVerificationToken.deleteMany({ _ownerId: user._id }),
    ]);
    user = await promoteIfAdminEmail(user);

    clearSessionCookie(res);
    res.json({ message: 'Your password has been reset. You can now sign in.' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new AppError(400, 'Password is incorrect.');
    }

    if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            throw new AppError(400, 'You are the only admin. Promote another admin before deleting your account.');
        }
    }

    await User.deleteOne({ _id: user._id });
    await cascadeUserDelete(user._id);

    clearSessionCookie(res);
    res.json({ message: 'Your account and all your content have been deleted.' });
});

export const logout = asyncHandler(async (req, res) => {
    if (req.user?._id) {
        await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    }
    clearSessionCookie(res);
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

    if (wantsPasswordChange) {
        const isSameAsCurrent = await bcrypt.compare(password, user.password);
        if (isSameAsCurrent) {
            throw new AppError(400, 'New password must be different from your current password.');
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
        user.emailVerified = false;
    }

    if (profilePicture !== undefined) {
        user.profilePicture = profilePicture;
    }

    if (password) {
        user.password = await bcrypt.hash(password, BCRYPT_COST);
        user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    }

    await user.save();

    if (wantsEmailChange) {
        await issueVerificationEmail(user);
    }

    sendSession(res, user);
});
