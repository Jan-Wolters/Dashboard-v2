import React from "react";
import Login from "../MainParts/login";

function CompanyLOG({ onLogin }) {
  return (
    <div className="w-auto mx-5 overflow-hidden shadow-lg">
      <Login onLogin={onLogin} /> {/* Pass onLogin as a prop */}
    </div>
  );
}

export default CompanyLOG;
