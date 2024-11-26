import React, { useState, useEffect } from "react";
import { User } from "../types";

interface UserModalProps {
	user: User | null;
	onSave: (user: User) => void;
	onClose: () => void;
}

const UserModal = ({ user, onSave, onClose }: UserModalProps) => {
	const [formData, setFormData] = useState<User>({
		name: "",
		handle: "",
		phone: "",
		level: "general",
	});

	useEffect(() => {
		if (user) {
			setFormData(user);
		}
	}, [user]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(formData);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6">
					{user ? "Edit User" : "Add New User"}
				</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							VJudge Handle
						</label>
						<input
							type="text"
							value={formData.handle}
							onChange={(e) =>
								setFormData({ ...formData, handle: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<input
							type="tel"
							value={formData.phone}
							onChange={(e) =>
								setFormData({ ...formData, phone: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Level
						</label>
						<select
							value={formData.level}
							onChange={(e) =>
								setFormData({
									...formData,
									level: e.target.value as User["level"],
								})
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="beginner">Beginner</option>
							<option value="intermediate">Intermediate</option>
							<option value="advanced">Advanced</option>
							<option value="general">General</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Group Number
						</label>
						<input
							type="number"
							min="1"
							value={formData.group}
							onChange={(e) =>
								setFormData({ ...formData, group: parseInt(e.target.value) })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
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
							{user ? "Save Changes" : "Add User"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UserModal;
