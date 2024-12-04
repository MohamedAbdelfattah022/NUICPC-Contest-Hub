import axios from "axios";
import { sessionService } from "./sessionService";

const API_URL = import.meta.env.VITE_API_URL;

export const register = async (
	token: string,
	password: string,
	fullName: string
) => {
	try {
		const response = await axios.post(`${API_URL}/admin/register`, {
			token,
			password,
			fullName,
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data?.message || "Registration failed");
		}
		throw error;
	}
};

export const login = async (email: string, password: string) => {
	try {
		const response = await axios.post(`${API_URL}/admin/login`, {
			email,
			password,
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data?.message || "Login failed");
		}
		throw error;
	}
};

export const logout = async () => {
	try {
		const token = localStorage.getItem("accessToken");
		if (token) {
			try {
				await axios.post(
					`${API_URL}/admin/logout`,
					{},
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
			} catch (error) {
				console.log(error);
			}
		}
		sessionService.stopSessionMonitoring();
		localStorage.removeItem("accessToken");
	} catch (error) {
		console.error("Logout failed:", error);
	}
};

export const inviteAdmin = async (email: string) => {
	try {
		const token = localStorage.getItem("accessToken");
		const response = await axios.post(
			`${API_URL}/admin/invite`,
			{ email },
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data?.message || "Invitation failed");
		}
		throw error;
	}
};

export const forgotPassword = async (email: string) => {
	try {
		const response = await axios.post(`${API_URL}/admin/forgot`, { email });
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				error.response?.data?.message || "Password reset request failed"
			);
		}
		throw error;
	}
};

export const resetPassword = async (token: string, password: string) => {
	try {
		const response = await axios.put(`${API_URL}/admin/reset-pass`, {
			token,
			password,
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data?.message || "Password reset failed");
		}
		throw error;
	}
};
