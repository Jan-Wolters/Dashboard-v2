import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useCookies } from "react-cookie"; // Import useCookies from react-cookie
import Dashboard from "./vieuw/RoutePath/Dashboard.tsx";
import Company from "./vieuw/RoutePath/CompanyADD.tsx";
import CompanyUP from "./vieuw/RoutePath/CompanyUPDATE.tsx";
import CompanyLOG from "./vieuw/RoutePath/Company_login.tsx";
import NavBar from "./vieuw/components/NavBar"; // Import the NavBar component

function App() {
  // Initialize isLoggedIn state based on the presence of a cookie
  const [cookies, , removeCookie] = useCookies(["authToken"]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!cookies.authToken);

  // Function to handle user login
  const handleLogin = () => {
    // Simulate a successful login for testing purposes
    localStorage.setItem("authToken", "yourAuthToken"); // Replace with your authentication token
    setIsLoggedIn(true);
    console.log("User logged in");
  };

  // Function to handle user logout
  const handleLogout = () => {
    // Remove the authToken cookie
    removeCookie("authToken");
    console.log("User logged out");
    // Refresh the page upon successful logout
    window.location.reload();
  };

  // ProtectedRoute component to conditionally render routes based on login status
  const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
    if (isLoggedIn) {
      return element;
    } else {
      console.log("Redirecting to home page");
      return <Navigate to="/" />;
    }
  };

  // Use useEffect to check authentication state based on the authToken cookie
  useEffect(() => {
    const authToken = cookies.authToken;
    setIsLoggedIn(!!authToken);
  }, [cookies]);

  return (
    <Router>
      <div className="mt-4">
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
