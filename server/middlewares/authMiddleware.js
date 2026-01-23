import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const SECRET = process.env.JWT_SECRET;

    const token = req.headers['x-authorization'];

    if (token) {
        try {
            const decodedToken = jwt.verify(token, SECRET);
            req.user = decodedToken;
            next();
        } catch (err) {
            req.user = undefined;
            next();
        }
    } else {
        next();
    }
};