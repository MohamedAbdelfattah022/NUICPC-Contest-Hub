import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

class AuthService {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.loginInProgress = null;
    }

    async getToken() {
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        if (this.loginInProgress) {
            return this.loginInProgress;
        }

        this.loginInProgress = this._login();
        try {
            const token = await this.loginInProgress;
            return token;
        } finally {
            this.loginInProgress = null;
        }
    }

    async _login() {
        const loginUrl = "https://vjudge.net/user/login";
        const payload = {
            username: process.env.VJUDGE_USERNAME,
            password: process.env.VJUDGE_PASSWORD,
        };

        try {
            const response = await fetch(loginUrl, {
                method: 'POST',
                body: new URLSearchParams(payload),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const cookie = response.headers.get('set-cookie');
            if (!cookie) {
                throw new Error("No authentication token received");
            }

            this.token = cookie;
            this.tokenExpiry = Date.now() + (15 * 60 * 1000);

            return cookie;
        } catch (error) {
            console.error('Authentication failed:', error);
            throw new Error('Failed to authenticate with VJudge');
        }
    }

    async makeAuthenticatedRequest(url, options = {}) {
        const token = await this.getToken();
        const headers = {
            ...options.headers,
            Cookie: token,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.token = null;
                this.tokenExpiry = null;
                return this.makeAuthenticatedRequest(url, options);
            }
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response;
    }
}

const authService = new AuthService();
export default authService;