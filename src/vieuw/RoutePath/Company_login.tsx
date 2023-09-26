import React from "react";
import Login from "../MainParts/login";
import NavBar from "../components/NavBar";

function CompanyLOG({ onLogin }) {
  return (
    <div className="w-auto mx-5 overflow-hidden shadow-lg">
      <Login />
    </div>
  );
}

export default CompanyLOG;
