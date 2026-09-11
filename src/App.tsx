import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <main className="grow">
          <Routes>
            {/* Login Page */}
            <Route path="/" element={<LoginPage />} />

            {/* Dashboard — guarded. The guard is a UX layer only; the backend
                is what actually enforces authorisation on every request. */}
            <Route
              path="/AdminDashboard"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
