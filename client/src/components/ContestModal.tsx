import React, { useState, useEffect } from "react";
import { Contest } from "../types";

interface ContestModalProps {
	contest: Contest | null;
	onSave: (contestData: {
		contestId: string;
		name?: string;
		startTime?: string;
		duration?: number;
		status?: Contest["status"];
	}) => void;
	onClose: () => void;
}

const ContestModal = ({ contest, onSave, onClose }: ContestModalProps) => {
	const [formData, setFormData] = useState({
		contestId: "",
		name: "",
		startTime: "",
		duration: 0,
		status: "upcoming" as Contest["status"],
	});

	useEffect(() => {
		if (contest) {
			setFormData({
				contestId: contest._id,
				name: contest.name,
				startTime: contest.startTime,
				duration: contest.duration,
				status: contest.status,
			});
		}
	}, [contest]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// For new contest, only contestId is required
		if (!contest && !formData.contestId) {
			return;
		}

		// For existing contest, prepare update payload
		const payload = contest
			? {
					contestId: formData.contestId,
					name: formData.name,
					startTime: formData.startTime,
					duration: formData.duration,
					status: formData.status,
			  }
			: { contestId: formData.contestId };

		onSave(payload);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
			<div className="bg-white rounded-lg p-8 w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6">
					{contest ? "Edit Contest" : "Add New Contest"}
				</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Contest ID
						</label>
						<input
							type="text"
							value={formData.contestId}
							onChange={(e) =>
								setFormData({ ...formData, contestId: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={!!contest}
							required
						/>
					</div>

					{contest && (
						<>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Contest Name
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								{/* <label className="block text-sm font-medium text-gray-700 mb-1">
									Start Time
								</label>
								<input
									type="datetime-local"
									value={formData.startTime}
									onChange={(e) =>
										setFormData({ ...formData, startTime: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/> */}
							</div>
							<div>
								{/* <label className="block text-sm font-medium text-gray-700 mb-1">
									Duration (minutes)
								</label>
								<input
									type="number"
									value={formData.duration}
									onChange={(e) =>
										setFormData({
											...formData,
											duration: parseInt(e.target.value),
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/> */}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Status
								</label>
								<select
									value={formData.status}
									onChange={(e) =>
										setFormData({
											...formData,
											status: e.target.value as Contest["status"],
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="upcoming">Upcoming</option>
									<option value="active">Active</option>
									<option value="completed">Completed</option>
								</select>
							</div>
						</>
					)}

					<div className="mt-6 flex justify-end space-x-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-600 hover:text-gray-800"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							{contest ? "Save Changes" : "Add Contest"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ContestModal;
