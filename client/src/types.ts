export interface Contest {
	_id: string;
	name: string;
	startTime: string;
	duration: number;
	status: "upcoming" | "active" | "completed";
	length: number;
}

export interface User {
	_id: string;
	name: string;
	phone: string;
	level: "beginner" | "intermediate" | "advanced";
}

export interface Contestant {
	handle: string;
	display_name: string;
	total_solved: number;
	total_time: number;
	solved_problems: number[];
	first_solves: number[];
	attempted_problems: number[];
}

export interface ApiError {
	message: string;
	status?: number;
}
