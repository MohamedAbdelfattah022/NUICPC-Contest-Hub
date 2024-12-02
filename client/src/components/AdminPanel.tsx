import { useState } from "react";
import Sidebar from "./Sidebar";
import ContestManagement from "./ContestManagement";
import UserManagement from "./UserManagement";
import AdminInvite from "./AdminInvite";

const AdminPanel = () => {
	const [activeTab, setActiveTab] = useState("contests");

	return (
		<div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
			<Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
			<div className="flex-1 p-6 overflow-auto">
				{activeTab === "contests" && <ContestManagement />}
				{activeTab === "users" && <UserManagement />}
				{activeTab === "invite" && <AdminInvite />}
			</div>
		</div>
	);
};

export default AdminPanel;
