import { useState, useEffect } from "react";
import { PlusCircle, Search, Upload, Download } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Papa from "papaparse";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import BulkImportModal from "./BulkImportModal";
import { User } from "../types";
import {
	getUsers,
	createUser,
	updateUser,
	deleteUser,
	createBulkUsers,
} from "../services/api";
import axios from "axios";

const UserManagement = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [showBulkImport, setShowBulkImport] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [exporting, setExporting] = useState(false);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const data = await getUsers();
			setUsers(data);
		} catch (error) {
			toast.error("Failed to fetch users");
			console.error("Error fetching users:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveUser = async (userData: User) => {
		try {
			if (editingUser) {
				const { _id, ...userDataToUpdate } = userData;
				const updatedUser = await updateUser(_id, userDataToUpdate);
				setUsers(
					users.map((u) => (u._id === updatedUser._id ? updatedUser : u))
				);
				toast.success("User updated successfully!");
			} else {
				const newUser = await createUser(userData);
				setUsers([...users, newUser]);
				toast.success("User added successfully!");
			}
			setShowModal(false);
			setEditingUser(null);
		} catch (error) {
			if (error instanceof Error) {
				try {
					const errorData = JSON.parse(error.message);
					if (Array.isArray(errorData.errors)) {
						errorData.errors.forEach((err: string) => toast.error(err));
					} else {
						toast.error(error.message);
					}
				} catch {
					toast.error(error.message);
				}
			} else {
				toast.error("Failed to save user");
			}
		}
	};

	const handleBulkImport = async (usersData: Omit<User, "_id">[]) => {
		try {
			const response = await createBulkUsers(usersData);
			if (response.success.users.length > 0) {
				setUsers((prevUsers) => [...prevUsers, ...response.success.users]);
			}
			return response;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.data) {
				return error.response.data;
			}

			return {
				success: { count: 0, users: [] },
				failures: {
					count: usersData.length,
					details: usersData.map((data, index) => ({
						rowIndex: index + 1,
						data,
						error: "Failed to connect to server",
					})),
				},
			};
		}
	};

	const handleEditUser = (user: User) => {
		setEditingUser(user);
		setShowModal(true);
	};

	const handleDeleteUser = async (_id: string) => {
		const user = users.find((u) => u._id === _id);
		if (window.confirm(`Are you sure you want to delete "${user?.name}"?`)) {
			try {
				await deleteUser(_id);
				setUsers(users.filter((u) => u._id !== _id));
				toast.success("User deleted successfully!");
			} catch (error) {
				toast.error("Failed to delete user");
			}
		}
	};

	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.phone.includes(searchQuery) ||
			user.level.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const exportUsers = async () => {
		try {
			setExporting(true);
			const usersToExport = filteredUsers.map(({ _id, ...user }) => ({
				Name: user.name,
				Phone: user.phone,
				Level: user.level.charAt(0).toUpperCase() + user.level.slice(1),
			}));

			const csv = Papa.unparse(usersToExport, {
				header: true,
			});

			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			const timestamp = new Date().toISOString().split("T")[0];

			link.setAttribute("href", url);
			link.setAttribute(
				"download",
				`users_export_${timestamp}${
					searchQuery ? `_filtered_${searchQuery}` : ""
				}.csv`
			);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			toast.success(
				`Successfully exported ${usersToExport.length} user${
					usersToExport.length !== 1 ? "s" : ""
				}`
			);
		} catch (error) {
			toast.error("Failed to export users");
			console.error("Export error:", error);
		} finally {
			setExporting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-8">
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 5000,
					style: {
						maxWidth: "500px",
					},
				}}
			/>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-800">
					User Management
				</h1>
				<div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
					<button
						onClick={exportUsers}
						disabled={exporting || filteredUsers.length === 0}
						className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						<Download
							className={`w-5 h-5 mr-2 ${exporting ? "animate-bounce" : ""}`}
						/>
						{exporting ? "Exporting..." : "Export Users"}
					</button>
					<button
						onClick={() => setShowBulkImport(true)}
						className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors justify-center"
					>
						<Upload className="w-5 h-5 mr-2" />
						Import Users
					</button>
					<button
						onClick={() => {
							setEditingUser(null);
							setShowModal(true);
						}}
						className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors justify-center"
					>
						<PlusCircle className="w-5 h-5 mr-2" />
						Add User
					</button>
				</div>
			</div>

			<div className="relative mb-6">
				<input
					type="text"
					placeholder="Search users..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
				{searchQuery && (
					<div className="absolute right-4 top-3.5 text-sm text-gray-500">
						{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
					</div>
				)}
			</div>

			<UserTable
				users={filteredUsers}
				onEdit={handleEditUser}
				onDelete={handleDeleteUser}
			/>

			{showModal && (
				<UserModal
					user={editingUser}
					onSave={handleSaveUser}
					onClose={() => {
						setShowModal(false);
						setEditingUser(null);
					}}
				/>
			)}

			{showBulkImport && (
				<BulkImportModal
					onImport={handleBulkImport}
					onClose={() => setShowBulkImport(false)}
				/>
			)}
		</div>
	);
};

export default UserManagement;
