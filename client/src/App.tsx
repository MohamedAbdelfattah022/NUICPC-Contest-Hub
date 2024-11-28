import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import ContestList from "./components/ContestList";
import StandingsTable from "./components/StandingsTable";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route
						path="/admin/*"
						element={
							<ProtectedRoute>
								<AdminPanel />
							</ProtectedRoute>
						}
					/>
					<Route path="/" element={<ContestList />} />
					<Route path="/contest/standings" element={<StandingsTable />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
