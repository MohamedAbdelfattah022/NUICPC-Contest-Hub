import { useState } from "react";
import { Mail, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { inviteAdmin } from "../services/authService";

const AdminInvite = () => {
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
			await inviteAdmin(email);
			setSuccess(true);
			setEmail("");
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to send invitation"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
			<h2 className="text-xl font-semibold mb-4">Invite Admin</h2>

			{error && (
				<div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
					<AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
					<p className="text-sm text-red-700">{error}</p>
				</div>
			)}

			{success && (
				<div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
					<CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
					<p className="text-sm text-green-700">
						Invitation sent successfully!
					</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700"
					>
						Email Address
					</label>
					<div className="mt-1 relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="admin@example.com"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? (
						<>
							<Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
							Sending Invitation...
						</>
					) : (
						"Send Invitation"
					)}
				</button>
			</form>
		</div>
	);
};

export default AdminInvite;
