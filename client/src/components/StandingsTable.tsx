import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { getStandings } from "../services/api";
import { formatTime } from "../utils/Formatters";
import type { Contestant } from "../types";

const StandingsTable = () => {
	const location = useLocation();
	const contestId = location.state?.contestId;
	const contestName = location.state?.contestName;
	const [standings, setStandings] = useState<Contestant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			if (!contestId) throw new Error("Contest ID is required");
			console.log(contestId);
			const data = await getStandings(contestId);
			setStandings(data);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch standings data";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!contestId) {
			setError("No contest selected");
			return;
		}

		fetchData();
		const interval = setInterval(fetchData, 30 * 1000); // Refresh every 30 seconds
		return () => clearInterval(interval);
	}, [contestId]);

	const problems = Array.from({ length: 16 }, (_, i) =>
		String.fromCharCode(65 + i)
	);

	const getProblemStatus = (contestant: Contestant, problemIndex: number) => {
		if (contestant.solved_problems.includes(problemIndex)) {
			const isFirstSolve = contestant.first_solves.includes(problemIndex);
			return {
				solved: true,
				first: isFirstSolve,
				attempted: true,
			};
		}
		return {
			solved: false,
			first: false,
			attempted: contestant.attempted_problems.includes(problemIndex),
		};
	};

	if (error) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
					<div className="flex items-center text-red-600 mb-4">
						<AlertCircle className="w-6 h-6 mr-2" />
						<h2 className="text-xl font-semibold">Error</h2>
					</div>
					<p className="text-gray-600 text-center mb-4">{error}</p>
					<div className="flex space-x-4">
						<Link
							to="/"
							className="px-4 py-2 text-blue-600 hover:text-blue-800"
						>
							Back to Contests
						</Link>
						{contestId && (
							<button
								onClick={fetchData}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
							>
								Try Again
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div className="mb-8">
				<Link
					to="/"
					className="inline-flex items-center text-blue-600 hover:text-blue-800"
				>
					<ArrowLeft className="w-5 h-5 mr-2" />
					Back to Contests
				</Link>
				{contestName && (
					<h1 className="text-2xl font-bold text-gray-900 mt-4">
						{contestName} Standings
					</h1>
				)}
			</div>

			<div className="bg-white shadow-lg rounded-lg overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center p-8">
						<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Rank
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Handle
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Solved
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Time
									</th>
									{problems.map((problem) => (
										<th
											key={problem}
											className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											{problem}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{Array.isArray(standings) && standings.map((contestant, index) => (
									<tr
										key={contestant.handle}
										className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{index + 1}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="text-sm font-medium text-gray-900">
													{contestant.display_name}
												</div>
												<div className="ml-2 text-sm text-gray-500">
													({contestant.handle})
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{contestant.total_solved}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatTime(contestant.total_time)}
										</td>
										{problems.map((_, problemIndex) => {
											const status = getProblemStatus(contestant, problemIndex);
											return (
												<td
													key={problemIndex}
													className={`px-4 py-4 text-center text-sm ${
														status.solved
															? status.first
																? "bg-green-600 text-white"
																: "bg-green-100 text-green-800"
															: status.attempted
															? "bg-red-100 text-red-800"
															: ""
													}`}
												>
													{status.solved ? "✓" : status.attempted ? "✗" : ""}
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default StandingsTable;
