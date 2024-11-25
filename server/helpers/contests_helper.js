import Contest from '../models/contests_model.js';
import Standings from '../models/standings_model.js';
import { promises as fs } from 'fs';
import axios from "axios";
import { JSDOM } from "jsdom";
import authService from '../services/authService.js';

export const getContestLength = async (id) => {
    try {
        const response = await authService.makeAuthenticatedRequest(
            `https://vjudge.net/contest/${id}`
        );
        const html = await response.text();
        const dom = new JSDOM(html);
        const textarea = dom.window.document.querySelector('textarea[name="dataJson"]');

        if (textarea) {
            const contestData = JSON.parse(textarea.textContent);
            return contestData.problems.length;
        }

        console.error("Data not found");
        return 0;
    } catch (error) {
        console.error("Error:", error);
        return 0;
    }
}

export const handleContestData = async (contestId) => {
    const contestUrl = `https://vjudge.net/contest/rank/single/${contestId}`;

    try {
        const response = await authService.makeAuthenticatedRequest(contestUrl);
        const data = await response.json();
        const contestLength = await getContestLength(contestId);

        const contestName = data.title;
        const contestStartTime = data.begin;
        const contestDuration = data.length / 3600000;

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

        const standings = Object.entries(unifiedData).map(([participantId, data]) => {
            const solvedProblems = new Set();
            let totalTimePenalty = 0;

            for (const [problemIndex, solveTime] of data.solved_times) {
                solvedProblems.add(problemIndex);
                totalTimePenalty += solveTime;
            }

            data.attempted_problems = data.attempted_problems.filter(
                problem => !solvedProblems.has(problem)
            );

            return {
                handle: data.handle,
                display_name: data.display_name,
                total_solved: solvedProblems.size,
                total_time: totalTimePenalty,
                solved_problems: Array.from(solvedProblems),
                first_solves: data.first_solves,
                attempted_problems: data.attempted_problems,
            };
        });

        standings.sort((a, b) => {
            if (a.total_solved !== b.total_solved) return b.total_solved - a.total_solved;
            return a.total_time - b.total_time;
        });

        const now = Date.now();
        const contestEnd = contestStartTime + (contestDuration * 3600000);
        let contestStatus;
        if (now < contestStartTime) {
            contestStatus = 'upcoming';
        } else if (now >= contestStartTime && now <= contestEnd) {
            contestStatus = 'active';
        } else {
            contestStatus = 'completed';
        }

        const contest = new Contest({
            contestId,
            name: contestName,
            startTime: new Date(contestStartTime),
            duration: contestDuration,
            status: contestStatus,
            length: contestLength,
        });

        await contest.save();

        const standingsDoc = new Standings({
            contest: contest._id,
            standings,
        });

        await standingsDoc.save();

        return { contest, standings };
    } catch (error) {
        throw new Error(`Error processing contest data: ${error.message}`);
    }
};