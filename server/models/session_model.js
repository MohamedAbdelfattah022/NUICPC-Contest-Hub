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
    },
    isValid: {
        type: Boolean,
        default: true,
    },
    duration: {
        type: Number,
        default: 120,
    }
});

sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });
const Session = mongoose.model('Session', sessionSchema);
export default Session;