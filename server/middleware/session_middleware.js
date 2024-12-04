import Session from "../models/session_model.js";

const isSessionExpired = (session) => {
    const expiryTime = new Date(session.createdAt.getTime() + session.duration * 1000);
    return Date.now() > expiryTime;
}

export const validateSession = async (req, res, next) => {
    const sessions = await Session.find();
    if (sessions.length > 0 && isSessionExpired(sessions[0])) {
        try {
            await Session.deleteOne();
        } catch (error) {
            console.error(error);
        }
    }
    next();
};

