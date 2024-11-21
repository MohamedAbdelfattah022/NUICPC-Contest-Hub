import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import { User } from "../types";
import { getUsers, createUser, updateUser, deleteUser } from "../services/api";

const UserManagement = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

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
			toast.error(
				error instanceof Error ? error.message : "Failed to save user"
			);
		}
	};

	const handleEditUser = (user: User) => {
		setEditingUser(user);
		setShowModal(true);
	};

	const handleDeleteUser = async (_id: string) => {
		console.log("==========");
		console.log(_id);
		console.log("==========");
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

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-8">
			<Toaster position="top-right" />
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-800">
					User Management
				</h1>
				<button
					onClick={() => {
						setEditingUser(null);
						setShowModal(true);
					}}
					className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto justify-center"
				>
					<PlusCircle className="w-5 h-5 mr-2" />
					Add User
				</button>
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
		</div>
	);
};

export default UserManagement;
