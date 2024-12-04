import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Admin from '../models/admin_model.js'
import Session from '../models/session_model.js'

const generateTokens = (adminId) => {
    const accessToken = jwt.sign(
        {
            adminId,
            type: 'access',
            timestamp: Date.now(),
            uuid: uuidv4(),
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    return accessToken;
}

export const loginAdmin = async (email, password) => {
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error('Invalid credentials');

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) throw new Error('Invalid credentials');


    const isSessionActive = await Session.find();
    if (isSessionActive.length > 0) {
        const sessionAdmin = isSessionActive[0].adminId;
        const admin = await Admin.findById(sessionAdmin);
        throw new Error(`Login Denied: ${admin.fullName} is currently logged in. Please try again later.`);
    }

    const accessToken = generateTokens(admin._id);

    const session = new Session({
        adminId: admin._id,
        token: accessToken,
    });
    await session.save();

    admin.lastLogin = new Date();
    await admin.save();
    return accessToken;
}

export const logoutAdmin = async (sessionId) => {
    await Session.findByIdAndDelete(sessionId, { isValid: false });
};

export const verifySession = async (sessionId) => {
    const session = await Session.findById(sessionId);
    return session?.isValid || false;
};