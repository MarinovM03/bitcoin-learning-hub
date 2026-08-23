import User from '../models/User.js';
import { SESSION_MAX_AGE_MS } from './authCookies.js';

const MAX_REVOKED_SESSIONS = 50;

export const revokeSession = async (tokenPayload) => {
    const { _id, sid, exp } = tokenPayload;

    if (!sid) {
        await User.updateOne({ _id }, { $inc: { tokenVersion: 1 } });
        return;
    }

    const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + SESSION_MAX_AGE_MS);

    await User.updateOne({ _id }, { $pull: { revokedSessions: { expiresAt: { $lte: new Date() } } } });
    await User.updateOne({ _id }, {
        $push: {
            revokedSessions: {
                $each: [{ sid, expiresAt }],
                $slice: -MAX_REVOKED_SESSIONS,
            },
        },
    });
};

export const isSessionRevoked = (user, sid) =>
    Boolean(sid) && (user?.revokedSessions ?? []).some((entry) => entry.sid === sid);
