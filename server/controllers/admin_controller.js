import { rateLimit } from "express-rate-limit";
import bycrypt from "bcryptjs";
import crypto from "crypto";
import Admin from "../models/admin_model.js";
import { loginAdmin, logoutAdmin } from '../services/auth_service.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { sanitizeInput } from '../utils/sanitizers.js';
import emailService from '../services/emailService.js'
import UserRequest from "../models/user_request_model.js";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    essage: { message: 'Too many login attempts. Please try again later.' }
});

export const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many registration attempts. Please try again later.' }
});

const verifyToken = async (token) => {
    try {
        const userRequest = await UserRequest.findOne({ token });
        if (!userRequest) return false;
        const isExpired = userRequest.expiration < new Date();
        if (isExpired) {
            await UserRequest.deleteOne({ token });
            return false;
        }
        return true;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

export const register = async (req, res) => {
    try {
        const { token, password, fullName } = req.body;
        if (!token) return res.status(400).json({ message: 'Token is required' });
        if (!password) return res.status(400).json({ message: 'Password is required' });
        if (!fullName) return res.status(400).json({ message: 'Full name is required' });

        const exitingToken = await UserRequest.findOne({ token });
        if (!exitingToken) return res.status(400).json({ message: 'Invalid token' });
        const email = exitingToken.email;
        const sanitizedFullName = sanitizeInput(fullName);
        if (!validateEmail(exitingToken.email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and include numbers and special characters'
            });
        }
        if (!sanitizedFullName || sanitizedFullName.length < 2) {
            return res.status(400).json({ message: 'Full name is required' });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const salt = await bycrypt.genSalt(12);
        const hashedPassword = await bycrypt.hash(password, salt);
        const newAdmin = new Admin({
            email,
            password: hashedPassword,
            fullName: sanitizedFullName,
            createdAt: new Date()
        });

        await newAdmin.save();
        await exitingToken.deleteOne();
        res.status(201).json({
            message: 'Admin registered successfully',
            admin: {
                fullName: newAdmin.fullName,
                email: newAdmin.email,
                createdAt: newAdmin.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const inviteAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email address' });
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(409).json({ message: 'Email already registered' });

        const existingUserRequest = await UserRequest.findOne({ email, type: 'invitation' });
        if (existingUserRequest) return res.status(409).json({ message: 'Invitation already sent' });

        const invitationToken = crypto.randomUUID();
        const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const passwordSetupLink = `${process.env.FRONTEND_BASE_URL}/register?token=${encodeURIComponent(invitationToken)}`;
        const invitation = new UserRequest({
            email,
            token: invitationToken,
            expiration,
            type: 'invitation',
        });
        await invitation.save();
        await emailService.sendUserRequestService(email, passwordSetupLink);
        res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Invitation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const accessToken = await loginAdmin(email, password);

        res.json(accessToken);
    } catch (error) {
        res.status(401).json({
            error,
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        await logoutAdmin(req.sessionId);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out' });
    }
};

export const forgotPass = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email address' });
        const existingAdmin = await Admin.findOne({ email });
        if (!existingAdmin) return res.status(400).json({ message: 'Email does not exist' });

        const existingRequest = await UserRequest.findOne({ email, type: 'password_reset' });
        if (existingRequest) {
            await existingRequest.deleteOne();
        }

        const resetToken = crypto.randomUUID();
        const expiration = new Date(Date.now() + 15 * 60 * 1000);
        const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
        const resetRequest = new UserRequest({
            email,
            token: resetToken,
            expiration,
            type: 'password_reset'
        });
        await resetRequest.save();
        await emailService.resetPasswordService(email, resetLink);
        res.status(200).json({ message: 'Password reset link sent successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



export const resetPass = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

        const existingRequest = await UserRequest.findOne({ token, type: 'password_reset' });
        if (!existingRequest) return res.status(404).json({ message: 'No Such Request' });

        const isTokenValid = await verifyToken(token);
        if (!isTokenValid) return res.status(400).json({ message: 'Invalid or expired token' });

        const hashedPassword = await bycrypt.hash(password, 10);

        const existingAdmin = await Admin.findOne({ email: existingRequest.email });
        if (!existingAdmin) return res.status(400).json({ message: 'Email does not exist' });
        existingAdmin.password = hashedPassword;

        await existingAdmin.save();
        await UserRequest.deleteOne({ token });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
