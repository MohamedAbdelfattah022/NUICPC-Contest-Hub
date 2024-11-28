import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const register = async (
	email: string,
	password: string,
	fullName: string
) => {
	try {
		const response = await axios.post(`${API_URL}/admin/register`, {
			email,
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
		await axios.post(
			`${API_URL}/admin/logout`,
			{},
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
	} catch (error) {
		console.error("Logout failed:", error);
	}
};

// export const refreshAccessToken = async () => {
// 	try {
// 		const refreshToken = localStorage.getItem("refreshToken");
// 		if (!refreshToken) throw new Error("No refresh token");

// 		const response = await axios.post(`${API_URL}/admin/refresh-token`, {
// 			refreshToken,
// 		});

// 		const { accessToken, refreshToken: newRefreshToken } = response.data;
// 		localStorage.setItem("accessToken", accessToken);
// 		localStorage.setItem("refreshToken", newRefreshToken);

// 		return accessToken;
// 	} catch (error) {
// 		localStorage.removeItem("accessToken");
// 		localStorage.removeItem("refreshToken");
// 		throw error;
// 	}
// };

// export const verifySession = async () => {
// 	try {
// 		const token = localStorage.getItem("accessToken");
// 		const response = await axios.get(`${API_URL}/admin/verify-session`, {
// 			headers: { Authorization: `Bearer ${token}` },
// 		});
// 		return response.data.valid;
// 	} catch (error) {
// 		return false;
// 	}
// };
