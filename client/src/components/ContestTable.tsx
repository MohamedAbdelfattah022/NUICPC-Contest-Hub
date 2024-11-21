import { Edit3, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Contest } from "../types";
import { formatDuration } from "../utils/Formatters.ts";

interface ContestTableProps {
	contests: Contest[];
	onEdit: (contest: Contest) => void;
	onDelete: (contestId: string) => void;
}

const ContestTable = ({ contests, onEdit, onDelete }: ContestTableProps) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "upcoming":
				return "bg-blue-100 text-blue-800";
			case "active":
				return "bg-green-100 text-green-800";
			case "completed":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "upcoming":
				return <Clock className="w-4 h-4" />;
			case "active":
				return <CheckCircle2 className="w-4 h-4" />;
			case "completed":
				return <AlertCircle className="w-4 h-4" />;
			default:
				return null;
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-xl overflow-hidden">
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Name
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Start Time
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Duration
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Status
						</th>
						<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{contests.map((contest) => (
						<tr key={contest._id} className="hover:bg-gray-50">
							<td className="px-6 py-4 whitespace-nowrap font-medium text-sm text-gray-900">
								{contest.name}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{new Date(contest.startTime).toLocaleString()}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{formatDuration(contest.duration)}
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span
									className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
										contest.status
									)}`}
								>
									{getStatusIcon(contest.status)}
									<span className="ml-2">
										{contest.status.charAt(0).toUpperCase() +
											contest.status.slice(1)}
									</span>
								</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<button
									onClick={() => onEdit(contest)}
									className="text-blue-600 hover:text-blue-900 mr-4"
								>
									<Edit3 className="w-5 h-5" />
								</button>
								<button
									onClick={() => onDelete(contest._id)}
									className="text-red-600 hover:text-red-900"
								>
									<Trash2 className="w-5 h-5" />
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ContestTable;
