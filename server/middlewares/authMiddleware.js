import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
    const token = req.headers['x-authorization'];

    if (token) {
        try {
            const decodedToken = jwt.verify(token, SECRET);
            req.user = decodedToken;
            next();
        } catch (err) {
            res.status(401).json({ message: 'You are not authorized' });
        }
    } else {
        next();
    }
};