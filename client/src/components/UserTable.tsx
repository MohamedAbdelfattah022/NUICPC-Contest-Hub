import { Edit3, Trash2 } from "lucide-react";
import { User } from "../types";

interface UserTableProps {
	users: User[];
	onEdit: (user: User) => void;
	onDelete: (_id: string) => void;
}

const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
	const getLevelColor = (level: string) => {
		switch (level) {
			case "beginner":
				return "bg-green-100 text-green-800";
			case "intermediate":
				return "bg-blue-100 text-blue-800";
			case "advanced":
				return "bg-purple-100 text-purple-800";
			case "general":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-lg overflow-hidden">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Handle
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Phone
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Level
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Group
							</th>
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{users.map((user) => (
							<tr key={user._id} className="hover:bg-gray-50">
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">
										{user.name}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{user.handle}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{user.phone}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(
											user.level
										)}`}
									>
										{user.level.charAt(0).toUpperCase() + user.level.slice(1)}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									Group {user.group}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										onClick={() => onEdit(user)}
										className="text-blue-600 hover:text-blue-900 mr-4"
									>
										<Edit3 className="w-5 h-5" />
									</button>
									<button
										onClick={() => onDelete(user._id)}
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
		</div>
	);
};

export default UserTable;
