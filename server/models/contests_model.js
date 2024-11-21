import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    contestId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        default: 'Contest Name',
    },
    startTime: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        required: true,
        default: 'upcoming',
    },
    standings: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Standings'
    }
});

const Contest = mongoose.model('Contest', contestSchema);
export default Contest;