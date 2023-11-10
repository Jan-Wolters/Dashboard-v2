import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./vieuw/RoutePath/Dashboard.tsx";
import Company from "./vieuw/RoutePath/CompanyADD.tsx";
import CompanyUP from "./vieuw/RoutePath/CompanyUPDATE.tsx";
import CompanyLOG from "./vieuw/RoutePath/Company_login.tsx";
import NavBar from "./vieuw/components/NavBar";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    // Store the token in local storage
    localStorage.setItem("authToken", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    // Remove the token from local storage
    localStorage.removeItem("authToken");
    console.log("User logged out");
  };

  const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      return element;
    } else {
      console.log("Redirecting to home page");
      return <Navigate to="/" />;
    }
  };

  useEffect(() => {
    // Check if a token is already stored in local storage
    const storedToken = localStorage.getItem("authToken");

    if (storedToken) {
      // You may want to validate the token here
      setToken(storedToken);
    }

    setLoading(false);
  }, []); // Use an empty dependency array to ensure it runs only once

  if (loading) {
    // Show a loading indicator while checking the login status
    return <div>Loading...</div>;
  }

  return (
    <Router basename="/">
      <div className="mt-4">
        {token && (
          <div className="alert alert-success" role="alert">
            You are logged in!
          </div>
        )}
        <NavBar isLoggedIn={!!token} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Login" element={<CompanyLOG onLogin={handleLogin} />} />
          <Route
            path="/COMUP"
            element={<ProtectedRoute element={<CompanyUP />} />}
          />
          <Route
            path="/COMAD"
            element={<ProtectedRoute element={<Company />} />}
          />
          <Route element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
