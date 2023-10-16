import { Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

interface NavBarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

function NavBar({ isLoggedIn, onLogout }: NavBarProps) {
  return (
    <nav className="navbar border border-dark shadow-sm mb-2 bg-white rounded">
      <div className="d-flex justify-content-between align-items-center w-100 my-2">
        <div className="border-1 w-25">
          <div className="logo">
            <Link to="/" className="nav-link">
              <img
                src="src/assets/Schoonderwolf-diensten_logo.png"
                className="w-50"
                alt="Logo"
              />
            </Link>
          </div>
        </div>

        <div className="d-flex justify-content-center mx-auto">
          <div className="d-flex">
            <div className="nav-item me-4">
              <button id="refreshButton">Refresh</button>
            </div>
            {isLoggedIn ? (
              <>
                <div className="nav-item me-4">
                  <button onClick={onLogout} className="nav-link">
                    Logout
                  </button>
                </div>

                <div className="nav-item me-4">
                  <Link to="/companyADD" className="nav-link">
                    Add
                  </Link>
                </div>
                <div className="nav-item me-4">
                  <Link to="/companyUP" className="nav-link">
                    Delete
                  </Link>
                </div>
              </>
            ) : (
              <div className="nav-item me-4">
                <Link to="/Login" className="nav-link">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
