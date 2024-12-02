import mongoose from 'mongoose';

const userRequestSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiration: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['invitation', 'password_reset'],
    }
});

userRequestSchema.index({ expiration: 1 }, { expireAfterSeconds: 0 });

const UserRequest = mongoose.model('UserRequest', userRequestSchema);
export default UserRequest;