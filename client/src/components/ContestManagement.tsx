import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import ContestTable from "./ContestTable";
import ContestModal from "./ContestModal";
import { Contest } from "../types";
import {
	getContests,
	createContest,
	updateContest,
	deleteContest,
} from "../services/api";

const ContestManagement = () => {
	const [contests, setContests] = useState<Contest[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingContest, setEditingContest] = useState<Contest | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchContests();
	}, []);

	const fetchContests = async () => {
		try {
			setLoading(true);
			const data = await getContests();
			setContests(data);
		} catch (error) {
			toast.error("Failed to fetch contests");
			console.error("Error fetching contests:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveContest = async (contestData: Contest) => {
		try {
			if (editingContest) {
				const updatedContest = await updateContest(
					editingContest._id,
					contestData
				);
				setContests(
					contests.map((c) => (c._id === updatedContest._id ? updatedContest : c))
				);
				toast.success("Contest updated successfully!");
			} else {
				const newContest = await createContest(contestData);
				setContests([...contests, newContest]);
				toast.success("Contest added successfully!");
			}
			setShowModal(false);
			setEditingContest(null);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save contest"
			);
		}
	};

	const handleEditContest = (contest: Contest) => {
		setEditingContest(contest);
		setShowModal(true);
	};

	const handleDeleteContest = async (contestId: string) => {
		const contest = contests.find((c) => c._id === contestId);
		if (window.confirm(`Are you sure you want to delete "${contest?.name}"?`)) {
			try {
				await deleteContest(contestId);
				setContests(contests.filter((c) => c._id !== contestId));
				toast.success("Contest deleted successfully!");
			} catch (error) {
				toast.error("Failed to delete contest");
			}
		}
	};

	const filteredContests = contests.filter(
		(contest) =>
			contest &&
			(contest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				contest._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				contest.status?.toLowerCase().includes(searchQuery.toLowerCase()))
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
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-800">
					Contest Management
				</h1>
				<button
					onClick={() => {
						setEditingContest(null);
						setShowModal(true);
					}}
					className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					<PlusCircle className="w-5 h-5 mr-2" />
					Add Contest
				</button>
			</div>

			<div className="relative mb-6">
				<input
					type="text"
					placeholder="Search contests..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-12 pr-4 py-2 md:py-3 text-sm md:text-base rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
			</div>

			<div className="overflow-x-auto">
				<div className="min-w-full inline-block align-middle">
					<div className="overflow-hidden">
						{filteredContests.length > 0 ? (
							<ContestTable
								contests={filteredContests}
								onEdit={handleEditContest}
								onDelete={handleDeleteContest}
							/>
						) : (
							<div className="text-center py-6 text-gray-500">
								No contests found matching "{searchQuery}"
							</div>
						)}
					</div>
				</div>
			</div>

			{showModal && (
				<ContestModal
					contest={editingContest}
					onSave={handleSaveContest}
					onClose={() => {
						setShowModal(false);
						setEditingContest(null);
					}}
				/>
			)}
		</div>
	);
};

export default ContestManagement;
