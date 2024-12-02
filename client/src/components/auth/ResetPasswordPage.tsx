import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
	Lock,
	Eye,
	EyeOff,
	AlertCircle,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import { resetPassword } from "../../services/authService";

const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [token, setToken] = useState("");
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const resetToken = params.get("token");
		if (!resetToken) {
			navigate("/login");
		} else {
			setToken(resetToken);
		}
	}, [location, navigate]);

	const validateForm = () => {
		if (!formData.password) {
			setError("Password is required");
			return false;
		}

		if (formData.password.length < 8) {
			setError("Password must be at least 8 characters long");
			return false;
		}

		if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
			setError(
				"Password must contain at least one number and one special character"
			);
			return false;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!validateForm()) return;

		setIsLoading(true);
		try {
			await resetPassword(token, formData.password);
			navigate("/login", { state: { passwordReset: true } });
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Password reset failed"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="flex justify-center">
					<Lock className="w-12 h-12 text-blue-600" />
				</div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Reset your password
				</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
							<AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
							<p className="text-sm text-red-700">{error}</p>
						</div>
					)}

					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								New Password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								{formData.password && (
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-gray-400" />
										) : (
											<Eye className="h-5 w-5 text-gray-400" />
										)}
									</button>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700"
							>
								Confirm New Password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									value={formData.confirmPassword}
									onChange={(e) =>
										setFormData({
											...formData,
											confirmPassword: e.target.value,
										})
									}
									className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								{formData.confirmPassword && (
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-5 w-5 text-gray-400" />
										) : (
											<Eye className="h-5 w-5 text-gray-400" />
										)}
									</button>
								)}
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isLoading}
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<>
										<Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
										Resetting Password...
									</>
								) : (
									"Reset Password"
								)}
							</button>
						</div>

						<div className="flex items-center justify-center">
							<Link
								to="/login"
								className="flex items-center text-sm text-blue-600 hover:text-blue-500"
							>
								<ArrowLeft className="w-4 h-4 mr-1" />
								Back to Login
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
