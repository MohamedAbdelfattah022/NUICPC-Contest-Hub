import jwt from 'jsonwebtoken';
import Session from '../models/session_model.js';

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const session = await Session.findOne({
            token,
            adminId: decoded.adminId,
        })

        if (!session) {
            return res.status(401).json({ message: 'no session running' });
        }

        if (!session.isValid) {
            await Session.findByIdAndDelete(session._id);
            return res.status(401).json({ message: 'Invalid or expired session' });
        }

        req.admin = decoded;
        req.sessionId = session._id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            await Session.findOneAndDelete({ token });
            return res.status(401).json({ message: 'Token expired' });
        }

        return res.status(401).json({ message: 'Invalid token' });
    }
};