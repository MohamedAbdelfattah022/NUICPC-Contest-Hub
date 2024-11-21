import { Contest, Contestant } from '../types';

// Helper function to generate dates relative to now
const getRelativeDate = (days: number, hours: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

export const mockContests: Contest[] = [
  {
    id: 'contest-1',
    name: 'Weekly Programming Challenge #45',
    startTime: getRelativeDate(0, 2), // Starts in 2 hours
    duration: 180,
    status: 'upcoming',
    participants: 156
  },
  {
    id: 'contest-2',
    name: 'Advanced Algorithms Competition',
    startTime: getRelativeDate(-1), // Started yesterday
    duration: 240,
    status: 'active',
    participants: 342
  },
  {
    id: 'contest-3',
    name: 'Spring Coding Marathon 2024',
    startTime: getRelativeDate(-2), // Ended
    duration: 300,
    status: 'completed',
    participants: 523
  }
];

export const mockStandings: Record<string, Contestant[]> = {
  'contest-1': [], // No standings yet for upcoming contest
  'contest-2': [
    {
      handle: "LIUIR",
      display_name: "LIUIR",
      total_solved: 15,
      total_time: 1664140,
      solved_problems: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      first_solves: [5, 10, 12, 13, 14],
      attempted_problems: []
    },
    {
      handle: "OmarAbdelhameed",
      display_name: "Omar",
      total_solved: 15,
      total_time: 1928062,
      solved_problems: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      first_solves: [],
      attempted_problems: []
    },
    {
      handle: "haz_0661",
      display_name: "hamza",
      total_solved: 0,
      total_time: 0,
      solved_problems: [],
      first_solves: [],
      attempted_problems: [0]
    }
  ],
  'contest-3': [
    {
      handle: "AliceCode",
      display_name: "Alice",
      total_solved: 12,
      total_time: 1234567,
      solved_problems: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      first_solves: [1, 4, 7],
      attempted_problems: [12, 13]
    },
    {
      handle: "BobDev",
      display_name: "Bob",
      total_solved: 10,
      total_time: 1345678,
      solved_problems: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      first_solves: [2, 5],
      attempted_problems: [10, 11, 12]
    }
  ]
};