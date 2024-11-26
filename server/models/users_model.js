import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    handle: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'general'],
        required: true,
    },
    group: {
        type: Number,
    }
});

const User = mongoose.model('User', userSchema);
export default User;