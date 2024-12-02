import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../../services/authService";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (!email.trim()) {
			setError("Email is required");
			return;
		}

		setIsLoading(true);
		try {
			await forgotPassword(email);
			setSuccess(true);
			setEmail("");
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to process request"
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
				<p className="mt-2 text-center text-sm text-gray-600">
					Enter your email address and we'll send you a link to reset your
					password
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
							<AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
							<p className="text-sm text-red-700">{error}</p>
						</div>
					)}

					{success && (
						<div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
							<p className="text-sm text-green-700">
								Password reset link has been sent to your email address. Please
								check your inbox.
							</p>
						</div>
					)}

					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email address
							</label>
							<div className="mt-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Mail className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									placeholder="Enter your email"
								/>
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
										Sending...
									</>
								) : (
									"Send Reset Link"
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

export default ForgotPasswordPage;
