import { useState } from "react";
import { Trophy, Users, Menu, UserPlus } from "lucide-react";

interface SidebarProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const tabs = [
		{ id: "contests", icon: Trophy, label: "Contests" },
		{ id: "users", icon: Users, label: "Users" },
		{ id: "invite", icon: UserPlus, label: "Invite Admin" },
	];

	return (
		<div className="relative">
			<button
				className="md:hidden fixed top-4 right-4 z-20 p-2 bg-white rounded-lg shadow-lg"
				onClick={() => setIsOpen(!isOpen)}
			>
				<Menu className="w-6 h-6" />
			</button>

			<div
				className={`
          fixed md:static inset-y-0 left-0 z-10
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-transform duration-200 ease-in-out
          w-64 bg-white shadow-lg
        `}
			>
				<div className="p-6 mt-14 md:mt-0">
					<h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
				</div>
				<nav className="mt-6">
					{tabs.map(({ id, icon: Icon, label }) => (
						<div
							key={id}
							className={`flex items-center px-6 py-3 cursor-pointer ${
								activeTab === id
									? "bg-blue-50 text-blue-600"
									: "text-gray-600 hover:bg-gray-50"
							}`}
							onClick={() => {
								onTabChange(id);
								setIsOpen(false);
							}}
						>
							<Icon className="w-5 h-5 mr-3" />
							<span>{label}</span>
						</div>
					))}
				</nav>
			</div>
		</div>
	);
};

export default Sidebar;
