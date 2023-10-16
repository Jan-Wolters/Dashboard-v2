import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useCookies } from "react-cookie";
import Dashboard from "./vieuw/RoutePath/Dashboard.tsx";
import Company from "./vieuw/RoutePath/CompanyADD.tsx";
import CompanyUP from "./vieuw/RoutePath/CompanyUPDATE.tsx";
import CompanyLOG from "./vieuw/RoutePath/Company_login.tsx";
import NavBar from "./vieuw/components/NavBar";

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!cookies.authToken);

  const handleLogin = () => {
    // Simulate a successful login for testing purposes
    setCookie("authToken", "yourAuthToken", { path: "/" }); // Replace with your authentication token
    setIsLoggedIn(true);
    console.log("User logged in");
  };

  const handleLogout = () => {
    removeCookie("authToken");
    setIsLoggedIn(false);
    console.log("User logged out");
    // No need to refresh the page; state change will handle the rendering
  };

  const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
    if (isLoggedIn) {
      return element;
    } else {
      console.log("Redirecting to home page");
      return <Navigate to="/" />;
    }
  };

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
        <NavBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
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
