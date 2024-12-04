import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { logout } from "../services/authService";

const Navbar = () => {
	const [isAdmin, setIsAdmin] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const token = localStorage.getItem("accessToken");
		setIsAdmin(!!token);
	}, [location]);

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<nav className="bg-white shadow-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<Link
							to="/"
							className="flex items-center px-2 py-2 text-gray-700 hover:text-blue-600"
						>
							<img src={"out.png"} alt="Logo" className="h-16 w-16 mr-2" />
							<span className="font-semibold text-xl">Contest Hub</span>
						</Link>
					</div>

					{/* Desktop Menu */}
					<div className="hidden md:flex md:items-center md:space-x-4">
						{isAdmin && (
							<Link
								to="/admin"
								className="px-3 py-2 rounded-md text-gray-700 hover:text-blue-600"
							>
								Admin Panel
							</Link>
						)}
						{isAdmin && (
							<button
								onClick={handleLogout}
								className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-red-600"
							>
								<LogOut className="h-5 w-5 mr-1" />
								Logout
							</button>
						)}
					</div>

					{/* Mobile menu button */}
					{isAdmin && (
						<div className="flex items-center md:hidden">
							<button
								onClick={() => setIsOpen(!isOpen)}
								className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
							>
								{isOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Mobile menu */}
			{isOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						{isAdmin && (
							<Link
								to="/admin"
								className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600"
								onClick={() => setIsOpen(false)}
							>
								Admin Panel
							</Link>
						)}
						{isAdmin && (
							<button
								onClick={() => {
									setIsOpen(false);
									handleLogout();
								}}
								className="flex items-center w-full px-3 py-2 rounded-md text-gray-700 hover:text-red-600"
							>
								<LogOut className="h-5 w-5 mr-1" />
								Logout
							</button>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
