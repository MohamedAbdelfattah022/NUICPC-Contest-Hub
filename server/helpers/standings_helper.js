import Contest from '../models/contests_model.js';
import Standings from '../models/standings_model.js';
import authService from '../services/authService.js';

export const updateStandings = async (contestId) => {
    try {
        const contest = await Contest.findOne({ contestId });
        if (!contest) {
            throw new Error('Contest not found');
        } else if (contest.status === "completed") {
            console.log('Contest is completed. Fetching standings from database.');
            const existingStandings = await Standings.findOne({ 'contest': contest._id });
            return existingStandings.standings;
        }

        const contestUrl = `https://vjudge.net/contest/rank/single/${contestId}`;
        const response = await authService.makeAuthenticatedRequest(contestUrl);
        const data = await response.json();

        const unifiedData = {};
        const firstSolvesByProblem = new Map();

        for (const [participantId, info] of Object.entries(data.participants)) {
            unifiedData[participantId] = {
                handle: info[0],
                display_name: info[1],
                submissions: [],
                first_solves: [],
                attempted_problems: [],
                solved_times: new Map()
            };
        }

        for (const submission of data.submissions) {
            const [participantId, problemIndex, status, time] = submission;

            if (status === 1) {
                const participant = unifiedData[participantId];
                if (!participant.solved_times.has(problemIndex) || time < participant.solved_times.get(problemIndex)) {
                    participant.solved_times.set(problemIndex, time);
                }

                if (!firstSolvesByProblem.has(problemIndex) || time < firstSolvesByProblem.get(problemIndex).time) {
                    firstSolvesByProblem.set(problemIndex, { participantId, time });
                }
            }
        }

        for (const submission of data.submissions) {
            const [participantId, problemIndex, status, time] = submission;
            const submissionEntry = { problem_index: problemIndex, status, time };

            if (!unifiedData[participantId]) {
                unifiedData[participantId] = {
                    handle: "Unknown",
                    display_name: "Unknown",
                    submissions: [submissionEntry],
                    first_solves: [],
                    attempted_problems: status !== 1 ? [problemIndex] : [],
                    solved_times: new Map()
                };
            } else {
                unifiedData[participantId].submissions.push(submissionEntry);

                if (status !== 1 && !unifiedData[participantId].attempted_problems.includes(problemIndex)) {
                    unifiedData[participantId].attempted_problems.push(problemIndex);
                }
            }

            if (status === 1) {
                const firstSolve = firstSolvesByProblem.get(problemIndex);
                if (firstSolve && firstSolve.participantId === participantId && firstSolve.time === time) {
                    unifiedData[participantId].first_solves.push(problemIndex);
                }

                const index = unifiedData[participantId].attempted_problems.indexOf(problemIndex);
                if (index !== -1) {
                    unifiedData[participantId].attempted_problems.splice(index, 1);
                }
            }
        }
        
        const standings = [];
        for (const [participantId, data] of Object.entries(unifiedData)) {
            const solvedProblems = new Set();
            const wrongSubmissions = {};
            let totalTimePenalty = 0;
            const penaltyPerWrongSubmission = 20 * 60;

            for (const [problemIndex, solveTime] of data.solved_times) {
                solvedProblems.add(problemIndex);
                totalTimePenalty += solveTime;

                wrongSubmissions[problemIndex] = data.submissions
                    .filter(submission =>
                        submission.problem_index === problemIndex &&
                        submission.status === 0 &&
                        submission.time < solveTime
                    )
                    .map(submission => submission.time);
            }

            for (const [problemIndex, wrongTimes] of Object.entries(wrongSubmissions)) {
                totalTimePenalty += wrongTimes.length * penaltyPerWrongSubmission;
            }

            standings.push({
                handle: data.handle,
                display_name: data.display_name,
                total_solved: solvedProblems.size,
                total_time: totalTimePenalty,
                solved_problems: Array.from(solvedProblems),
                first_solves: data.first_solves,
                attempted_problems: data.attempted_problems.filter(
                    problem => !solvedProblems.has(problem)
                ),
            });
        }

        standings.sort((a, b) => {
            if (a.total_solved !== b.total_solved) return b.total_solved - a.total_solved;
            return a.total_time - b.total_time;
        });

        const existingStandings = await Standings.findOne({ 'contest': contest._id });
        if (existingStandings) {
            existingStandings.standings = standings;
            await existingStandings.save();
        } else {
            const newStandings = new Standings({
                contest: contest._id,
                standings: standings,
            });
            await newStandings.save();
        }

        return standings;
    } catch (error) {
        throw new Error(`Error updating standings: ${error.message}`);
    }
};