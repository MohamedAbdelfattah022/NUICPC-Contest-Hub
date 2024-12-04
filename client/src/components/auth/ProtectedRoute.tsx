import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { logout } from "../../services/authService";
import { sessionService } from "../../services/sessionService";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

interface TokenPayload {
	exp: number;
}

const isTokenExpired = (token: string): boolean => {
	try {
		const decodedToken = jwtDecode<TokenPayload>(token);
		const currentTime = Date.now() / 1000;
		return decodedToken.exp < currentTime;
	} catch (error) {
		console.error("Error decoding token:", error);
		return true;
	}
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const location = useLocation();
	const accessToken = localStorage.getItem("accessToken");

	useEffect(() => {
		const checkTokenExpiration = async () => {
			if (accessToken && isTokenExpired(accessToken)) {
				await logout();
				window.location.href = "/";
			}
		};

		checkTokenExpiration();

		sessionService.startSessionMonitoring();

		return () => {
			sessionService.stopSessionMonitoring();
		};
	}, [accessToken]);

	if (!accessToken) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
