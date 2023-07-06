import React, { useState } from "react";
import { saveCompany } from "../model/repositories.tsx"; // Assuming the API code is in a separate file called "api"

function CompanyADD() {
  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    port: "",
    veaamUsername: "",
    veaamPassword: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await saveCompany(formData);

      // Reset the form
      setFormData({
        name: "",
        ip: "",
        port: "",
        veaamUsername: "",
        veaamPassword: "",
      });

      console.log("Company saved successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div id="body" className="shadow-lg p-3 mb-5 bg-white rounded">
      <div id="head" className="border border-dark border border-3 mt-5">
        <div className="text-center py-3 position-relative d-flex align-items-center">
          <div className="flex-fill  py-2 px-3 mx-1">
            <span className="fw-bold">bedrijfs informatie</span>
          </div>
        </div>
      </div>
      <div className="h-auto w-auto">
        <form onSubmit={handleSubmit}>
          <div>
            <input
              className="form-control"
              type="text"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              className="form-control"
              type="text"
              name="ip"
              placeholder="Enter ip"
              value={formData.ip}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              className="form-control"
              type="text"
              name="port"
              placeholder="Enter port"
              value={formData.port}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              className="form-control"
              type="text"
              name="veaamUsername"
              placeholder="Enter Veeam username"
              value={formData.veaamUsername}
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              className="form-control"
              type="text"
              name="veaamPassword"
              placeholder="Enter Veeam password"
              value={formData.veaamPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export default CompanyADD;
