import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900,
    },
    isValid: {
        type: Boolean,
        default: true,
    },
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;