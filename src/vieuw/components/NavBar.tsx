import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

interface NavBarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

function NavBar({ isLoggedIn, onLogout }: NavBarProps) {
  const handleRefreshClick = () => {
    // Reload the page
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom shadow-sm mb-3">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img
            src="Schoonderwolf-diensten_logo.png"
            alt="Company Logo"
            className="navbar-logo img-fluid" // Keep the image responsive
            style={{ maxWidth: "150px" }} // Increase the maximum width
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <button
                id="refreshButton"
                className="btn btn-primary mx-2"
                onClick={handleRefreshClick}
              >
                Refresh
              </button>
            </li>
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <button onClick={onLogout} className="btn btn-danger">
                    Logout
                  </button>
                </li>
                <li className="nav-item">
                  <Link to="/companyADD" className="nav-link">
                    Add
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/companyUP" className="nav-link">
                    Delete
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link to="/Login" className="nav-link">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
