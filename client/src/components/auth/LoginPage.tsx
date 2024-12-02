import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { login } from "../../services/authService";

const LoginPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isLoading, setIsLoading] = useState(false);
	const [loginError, setLoginError] = useState("");

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.email.trim()) {
			newErrors.email = "email is required";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoginError("");

		if (!validateForm()) return;

		setIsLoading(true);
		try {
			const accessToken = await login(formData.email, formData.password);
			localStorage.setItem("accessToken", accessToken);
			navigate("/admin");
		} catch (error) {
			setLoginError(error instanceof Error ? error.message : "Login failed");
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
					Admin Login
				</h2>
				{location.state?.passwordReset && (
					<div className="mt-2 text-center text-sm text-green-600">
						Password has been reset successfully. Please login with your new
						password.
					</div>
				)}
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{loginError && (
						<div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
							<AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
							<p className="text-sm text-red-700">{loginError}</p>
						</div>
					)}

					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<User className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="email"
									name="email"
									type="text"
									autoComplete="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
										errors.email ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
								/>
							</div>
							{errors.email && (
								<p className="mt-2 text-sm text-red-600">{errors.email}</p>
							)}
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
										errors.password ? "border-red-300" : "border-gray-300"
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
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
							{errors.password && (
								<p className="mt-2 text-sm text-red-600">{errors.password}</p>
							)}
						</div>

						<div className="flex items-center justify-between">
							<div className="text-sm">
								<Link
									to="/forgot-password"
									className="font-medium text-blue-600 hover:text-blue-500"
								>
									Forgot your password?
								</Link>
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
										Signing in...
									</>
								) : (
									"Sign in"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
