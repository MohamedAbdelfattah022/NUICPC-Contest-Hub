import { rateLimit } from "express-rate-limit";
import bycrypt from "bcryptjs";
import Admin from "../models/admin_model.js";
import { loginAdmin, logoutAdmin, verifySession } from '../services/auth_service.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { sanitizeInput } from '../utils/sanitizers.js';

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

export const register = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        const sanitizedEmail = sanitizeInput(email);
        const sanitizedFullName = sanitizeInput(fullName);

        if (!validateEmail(sanitizedEmail)) {
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

        const existingAdmin = await Admin.findOne({ email: sanitizedEmail });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const salt = await bycrypt.genSalt(12);
        const hashedPassword = await bycrypt.hash(password, salt);

        const newAdmin = new Admin({
            email: sanitizedEmail,
            password: hashedPassword,
            fullName: sanitizedFullName,
            createdAt: new Date()
        });

        await newAdmin.save();

        res.status(201).json({
            message: 'Admin registered successfully',
            admin: {
                id: newAdmin._id,
                email: newAdmin.email,
                fullName: newAdmin.fullName,
                createdAt: newAdmin.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering admin' });
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
