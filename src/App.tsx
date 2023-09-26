import React, { useState } from "react";
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
import NavBar from "./vieuw/components/NavBar"; // Import the NavBar component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogin = () => {
    // Simulate a successful login for testing purposes
    setIsLoggedIn(false);
    console.log("User logged in");
  };

  const handleLogout = () => {
    // Implement the logout logic here, e.g., clearing cookies, etc.

    // Reset application state
    setIsLoggedIn(false);

    // Redirect to the login page
    return <Navigate to="/Login" />;
    console.log("User logged out");
  };

  const ProtectedRoute = ({ element, path }) => {
    if (isLoggedIn) {
      return element;
    } else {
      console.log("Redirecting to /Login");
      return <Navigate to="/Login" />;
    }
  };

  return (
    <Router>
      <div className="mt-4">
        {/* Display a message when logged in */}
        {isLoggedIn && (
          <div className="alert alert-success" role="alert">
            You are logged in!
          </div>
        )}
        <NavBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />{" "}
        {/* Pass isLoggedIn to NavBar */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Login" element={<CompanyLOG onLogin={handleLogin} />} />
          <Route
            path="/Company"
            element={<ProtectedRoute element={<Company />} />}
          />
          <Route
            path="/CompanyUP"
            element={<ProtectedRoute element={<CompanyUP />} />}
          />
          <Route
            path="/CompanyADD"
            element={<ProtectedRoute element={<Company />} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
