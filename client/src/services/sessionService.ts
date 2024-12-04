import { jwtDecode } from "jwt-decode";
import { logout } from "./authService";
import toast from "react-hot-toast";

interface TokenPayload {
	exp: number;
	adminId: string;
}

class SessionService {
	private sessionCheckInterval: number | null = null;
	private readonly CHECK_INTERVAL = 30000;

	startSessionMonitoring() {
		if (this.sessionCheckInterval) {
			return;
		}

		this.sessionCheckInterval = window.setInterval(() => {
			this.checkSession();
		}, this.CHECK_INTERVAL);
	}

	stopSessionMonitoring() {
		if (this.sessionCheckInterval) {
			clearInterval(this.sessionCheckInterval);
			this.sessionCheckInterval = null;
		}
	}

	async checkSession() {
		const token = localStorage.getItem("accessToken");
		if (!token) {
			this.handleSessionExpired();
			return;
		}

		try {
			const decodedToken = jwtDecode<TokenPayload>(token);
			const currentTime = Date.now() / 1000;

			if (decodedToken.exp < currentTime) {
				await this.handleSessionExpired();
			}
		} catch (error) {
			await this.handleSessionExpired();
		}
	}

	private async handleSessionExpired() {
		this.stopSessionMonitoring();

		try {
			await logout();
		} finally {
			localStorage.removeItem("accessToken");
			toast.error("Session expired. Please login again.", {
				duration: 5000,
				position: "top-center",
			});
			window.location.href = "/login";
		}
	}
}

export const sessionService = new SessionService();
