import Contest from "../models/contests_model.js";
import Standings from "../models/standings_model.js";
import { updateStandings } from '../helpers/standings_helper.js';
import mongoose from "mongoose";
import { Cache } from "../services/caching_service.js";

const CACHE_DURATION = 15 * 60 * 1000;
const standingsCache = new Cache(CACHE_DURATION);

export const getStandings = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid Contest ID'
            });
        }

        const cachedData = standingsCache.get(id);
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            return res.status(200).json(cachedData.standings);
        }

        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({
                message: 'Contest not found'
            });
        }

        try {
            const standings = await updateStandings(contest.contestId);
            standingsCache.set(id, {
                standings,
                timestamp: Date.now()
            });

            return res.status(200).json(standings);
        } catch (error) {
            console.warn('Failed to fetch/update standings externally. Attempting database cache...');

            const existingStandings = await Standings.findOne({ contest: id });
            if (existingStandings) {
                const standings = existingStandings.standings;

                standingsCache.set(id, {
                    standings,
                    timestamp: Date.now()
                });

                return res.status(200).json(standings);
            }
            throw error;
        }
    } catch (error) {
        console.error('Error fetching standings:', error.message);
        return res.status(500).json({
            message: 'Error fetching standings',
            error: error.message
        });
    }
};

export default {
    getStandings
};
