import fetch from 'node-fetch';
import Contest from '../models/contests_model.js';
import Standings from '../models/standings_model.js';
import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';
import axios from "axios";
import { JSDOM } from "jsdom";
dotenv.config();

export const handleContestData = async (contestId) => {
    const loginUrl = "https://vjudge.net/user/login";
    const contestUrl = `https://vjudge.net/contest/rank/single/${contestId}`;

    try {
        // Login to fetch the cookie
        const payload = {
            username: process.env.user,
            password: process.env.password,
        };
        const loginResponse = await fetch(loginUrl, {
            method: 'POST',
            body: new URLSearchParams(payload),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!loginResponse.ok) {
            throw new Error("Login failed.");
        }

        const cookie = loginResponse.headers.get('set-cookie');

        // Fetch standings
        const standingsResponse = await fetch(contestUrl, {
            headers: { Cookie: cookie },
        });

        if (!standingsResponse.ok) {
            throw new Error("Failed to fetch contest standings.");
        }

        const response = await standingsResponse.json();
        console.log('Full response:', JSON.stringify(response, null, 2));
        console.log("================================");
        console.log("================================");

        // Extract contest details
        const contestName = response.title;
        const contestStartTime = response.begin; // ISO Format
        const contestDuration = response.length / 3600000;

        // Process and transform standings data
        const unifiedData = {};
        const firstSolves = {};

        for (const [participantId, info] of Object.entries(response.participants)) {
            unifiedData[participantId] = {
                handle: info[0],
                display_name: info[1],
                submissions: [],
                first_solves: [],
                attempted_problems: [],
            };
        }

        for (const submission of response.submissions) {
            const [participantId, problemIndex, status, time] = submission;
            const submissionEntry = { problem_index: problemIndex, status, time };

            if (!unifiedData[participantId]) {
                unifiedData[participantId] = {
                    handle: "Unknown",
                    display_name: "Unknown",
                    submissions: [submissionEntry],
                    first_solves: [],
                    attempted_problems: status !== 1 ? [problemIndex] : [],
                };
            } else {
                unifiedData[participantId].submissions.push(submissionEntry);

                if (status !== 1 && !unifiedData[participantId].attempted_problems.includes(problemIndex)) {
                    unifiedData[participantId].attempted_problems.push(problemIndex);
                }
            }

            if (status === 1) {
                if (!firstSolves[problemIndex] || time < firstSolves[problemIndex].time) {
                    firstSolves[problemIndex] = { participant_id: participantId, time };
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
            const firstSolvedProblems = new Set();

            for (const submission of data.submissions) {
                if (submission.status === 1) {
                    const problemIndex = submission.problem_index;
                    solvedProblems.add(problemIndex);
                    totalTimePenalty += submission.time;

                    if (firstSolves[problemIndex]?.participant_id === participantId) {
                        firstSolvedProblems.add(problemIndex);
                    }
                }
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
                first_solves: Array.from(firstSolvedProblems),
                attempted_problems: data.attempted_problems,
            };
        });

        standings.sort((a, b) => {
            if (a.total_solved !== b.total_solved) return b.total_solved - a.total_solved;
            return a.total_time - b.total_time;
        });
        console.log(standings);
        console.log(contestStartTime);

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
        });

        await contest.save();

        const standingsDoc = new Standings({
            contest: contest._id,
            standings,
        });

        await standingsDoc.save();
        await fs.writeFile(
            `${contestId}StandingsData.json`,
            JSON.stringify(standings, null, 4),
            'utf-8'
        );

        return { contest, standings };
    } catch (error) {
        throw new Error(`Error processing contest data: ${error.message}`);
    }
};



export const getContestLength = async (id) => {
    try {
        const response = await axios.get(`https://vjudge.net/contest/${id}`, {
            headers: {
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            },
        });
        const dom = new JSDOM(response.data);
        const textarea = dom.window.document.querySelector('textarea[name="dataJson"]');
        if (textarea) {
            const contestData = JSON.parse(textarea.textContent);
            return contestData.problems.length;
        } else {
            console.error("Data not found");
            return 0;
        }
    } catch (error) {
        console.error("Error:", error);
        return 0;
    }
}