import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    handle: {
        type: String
    },
    display_name: {
        type: String
    },
    total_solved: {
        type: Number
    },
    total_time: {
        type: Number
    },
    solved_problems: {
        type: [Number]
    },
    first_solves: {
        type: [Number]
    },
    attempted_problems: {
        type: [Number]
    }
});

const standingsSchema = new mongoose.Schema({
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        contestId: {
            type: Number,
            required: true
        },
        ref: 'Contest',
        required: true
    },
    standings: [participantSchema]
});

const Standings = mongoose.model('Standings', standingsSchema);
export default Standings;
