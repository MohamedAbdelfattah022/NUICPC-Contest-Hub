import axios from "axios";
import { Contest, Contestant, User } from "../types";
import { jwtDecode } from "jwt-decode";
import { sessionService } from "./sessionService";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			try {
				const decodedToken = jwtDecode<{ exp: number }>(token);
				const currentTime = Date.now() / 1000;

				if (decodedToken.exp < currentTime) {
					localStorage.clear();
					window.location.href = "/login";
					return Promise.reject("Token expired");
				}

				config.headers.Authorization = `Bearer ${token}`;
			} catch (error) {
				localStorage.clear();
				window.location.href = "/login";
				return Promise.reject("Invalid token");
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			await sessionService.checkSession();
		}
		return Promise.reject(error);
	}
);

export const getContests = async (): Promise<Contest[]> => {
	try {
		const response = await api.get("/contests");
		return response.data.contests;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const getContestById = async (id: string): Promise<Contest> => {
	try {
		const response = await api.get(`/contests/${id}`);
		return response.data.contest;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const createContest = async (
	contestData: Partial<Contest>
): Promise<Contest> => {
	try {
		const response = await api.post("/contests", contestData);
		return response.data.contest;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const updateContest = async (
	id: string,
	contestData: Partial<Contest>
): Promise<Contest> => {
	try {
		const response = await api.put(`/contests/${id}`, contestData);
		return response.data.contest;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const deleteContest = async (id: string): Promise<void> => {
	try {
		await api.delete(`/contests/${id}`);
	} catch (error) {
		throw handleApiError(error);
	}
};

export const getStandings = async (
	contestId: string | { id: string }
): Promise<Contestant[]> => {
	try {
		const id = typeof contestId === "object" ? contestId.id : contestId;
		const response = await api.get(`/standings/${id}`);
		return response.data;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const getUsers = async (): Promise<User[]> => {
	try {
		const response = await api.get("/users");
		return response.data;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const getUserById = async (id: string): Promise<User> => {
	try {
		const response = await api.get(`/users/${id}`);
		return response.data;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const createUser = async (userData: Omit<User, "id">): Promise<User> => {
	try {
		const response = await api.post("/users", userData);
		return response.data.newUser;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const updateUser = async (
	id: string,
	userData: Partial<User>
): Promise<User> => {
	try {
		const response = await api.patch(`/users/${id}`, userData);
		return response.data.user;
	} catch (error) {
		throw handleApiError(error);
	}
};

export const deleteUser = async (id: string): Promise<void> => {
	try {
		await api.delete(`/users/${id}`);
	} catch (error) {
		throw handleApiError(error);
	}
};

export const createBulkUsers = async (users: Omit<User, "_id">[]) => {
	const response = await api.post("/users/bulk", { users });
	return response.data;
};

const handleApiError = (error: unknown): Error => {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message || error.message;
		return new Error(message);
	}
	return error instanceof Error
		? error
		: new Error("An unknown error occurred");
};
