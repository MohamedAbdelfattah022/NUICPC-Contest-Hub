import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import ContestList from "./components/ContestList";
import StandingsTable from "./components/StandingsTable";

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-50">
				<Routes>
					<Route path="/admin/*" element={<AdminPanel />} />
					<Route path="/" element={<ContestList />} />
					<Route path="/contest/standings" element={<StandingsTable />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
