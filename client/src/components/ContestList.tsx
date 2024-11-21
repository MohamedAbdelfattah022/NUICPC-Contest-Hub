import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Trophy, AlertCircle } from "lucide-react";
import { getContests } from "../services/api";
import type { Contest } from "../types";
import { formatDuration } from "../utils/Formatters.ts";

const ContestList = () => {
	const [contests, setContests] = useState<Contest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchContests = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await getContests();
				setContests(data);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to fetch contests";
				setError(errorMessage);
				console.error("Error fetching contests:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchContests();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen px-4">
				<div className="flex items-center text-red-600 mb-4">
					<AlertCircle className="w-8 h-8 mr-2" />
					<h2 className="text-xl font-semibold">Error</h2>
				</div>
				<p className="text-gray-600 text-center">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center">
				<Trophy className="w-10 h-10 mr-4 text-blue-600" />
				Programming Contests
			</h1>

			{contests.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-600">No contests available at the moment.</p>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{contests.map((contest) => (
						<div
							key={contest._id}
							className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
							onClick={() =>
								navigate("/contest/standings", {
									state: {
										contestId: contest._id.toString(),
										contestName: contest.name,
									},
								})
							}
						>
							<div className="p-6">
								<h2 className="text-xl font-semibold text-gray-900 mb-2">
									{contest.name}
								</h2>
								<div className="space-y-2">
									<p className="text-gray-600">
										<span className="font-medium">Start:</span>{" "}
										{new Date(contest.startTime).toLocaleString()}
									</p>
									<p className="text-gray-600">
										<span className="font-medium">Duration:</span>{" "}
										{formatDuration(contest.duration)}
									</p>
									<div
										className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
											contest.status === "upcoming"
												? "bg-blue-100 text-blue-800"
												: contest.status === "active"
												? "bg-green-100 text-green-800"
												: "bg-gray-100 text-gray-800"
										}`}
									>
										{contest.status.charAt(0).toUpperCase() +
											contest.status.slice(1)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ContestList;
