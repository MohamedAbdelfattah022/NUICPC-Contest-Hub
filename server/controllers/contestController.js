import Contest from "../models/contests_model.js";
import Standings from "../models/standings_model.js";
import mongoose from "mongoose";
import { handleContestData } from '../helpers/contests_helper.js';


export const createContest = async (req, res) => {
    try {
        const { contestId } = req.body;

        if (!contestId) {
            return res.status(400).json({ message: 'Contest ID is required' });
        }

        const existingContest = await Contest.findOne({ contestId });
        if (existingContest) {
            return res.status(409).json({ message: 'Contest with the same ID already exists' });
        }

        const { contest, standings } = await handleContestData(contestId);

        res.status(201).json({
            message: 'Contest created successfully',
            contest,
            standings,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating contest',
            error: error.message,
        });
    }
};

// export const createContest = async (req, res) => {
//     try {
//         const {
//             contestId,
//             name,
//             startTime,
//             duration,
//             status
//         } = req.body;

//         if (!contestId || !startTime) {
//             return res.status(400).json({
//                 message: 'Contest ID and Start Time are required'
//             });
//         }

//         const existingContest = await Contest.findOne({ contestId });
//         if (existingContest) {
//             return res.status(409).json({
//                 message: 'Contest with the same ID already exists'
//             });
//         }

//         const newContest = new Contest({
//             contestId,
//             name,
//             startTime,
//             duration: duration || 0,
//             status: status || "upcoming"
//         });

//         const savedContest = await newContest.save();
//         res.status(201).json({
//             message: 'Contest created successfully',
//             contest: savedContest
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: 'Error creating contest',
//             error: error.message
//         });
//     }
// };

export const getAllContests = async (req, res) => {
    try {
        const {
            status,
            sortBy = 'startTime',
            orderBy = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        const filter = status ? { status } : {};

        const sortOptions = {
            [sortBy]: orderBy === 'desc' ? -1 : 1
        };

        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);
        const skip = (pageNumber - 1) * pageLimit;

        const contests = await Contest.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageLimit);
        // .populate('standings');

        const totalContests = await Contest.countDocuments(filter);

        res.status(200).json({
            contests,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalContests / pageLimit),
                totalContests
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching contests',
            error: error.message
        });
    }
};



export const getContestById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid Contest ID'
            });
        }

        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({
                message: 'Contest not found'
            });
        }

        res.status(200).json({ contest });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching contest',
            error: error.message
        });
    }
};

export const updateContest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid contest ID'
            });
        }

        // if (updateData.contestId) {
        //     delete updateData.contestId;
        // }
        if (updateData.status &&
            !['upcoming', 'active', 'completed'].includes(updateData.status)) {
            return res.status(400).json({
                message: 'Invalid contest status'
            });
        }

        const updatedContest = await Contest.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedContest) {
            return res.status(404).json({
                message: 'Contest not found'
            });
        }

        res.status(200).json({
            message: 'Contest updated successfully',
            contest: updatedContest
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating contest',
            error: error.message
        });
    }
}

export const deleteContest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid contest ID'
            });
        }

        const deletedContest = await Contest.findByIdAndDelete(id);

        if (!deletedContest) {
            return res.status(404).json({
                message: 'Contest not found'
            });
        }

        res.status(200).json({
            message: 'Contest deleted successfully',
            contest: deletedContest
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting contest',
            error: error.message
        });
    }
};




export default {
    createContest,
    getAllContests,
    getContestById,
    updateContest,
    deleteContest
};