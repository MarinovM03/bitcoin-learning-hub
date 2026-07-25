import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_COOKIE } from '../utils/authCookies.js';

export const authMiddleware = (req, res, next) => {
    const SECRET = process.env.JWT_SECRET;

    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

    if (token) {
        try {
            const decodedToken = jwt.verify(token, SECRET);
            req.user = decodedToken;
            next();
        } catch {
            req.user = undefined;
            next();
        }
    } else {
        next();
    }
};
