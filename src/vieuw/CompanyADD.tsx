import React, { useState, ChangeEvent, FormEvent } from "react";
import { saveCompany } from "../model/repositories.tsx";

function CompanyADD() {
  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    port: "",
    veaamUsername: "",
    veaamPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));

    setMessage(""); // Clear the error message
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Check if any of the fields are empty
    if (
      formData.name === "" ||
      formData.ip === "" ||
      formData.port === "" ||
      formData.veaamUsername === "" ||
      formData.veaamPassword === ""
    ) {
      console.error("Error saving company: Empty field(s)");
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      console.log("Submitting form data:", formData); // Debugging: Check form data before submission

      await saveCompany(formData);
      console.log("Company saved successfully");

      setMessage("Company saved successfully");
      console.log("Updated message value:", message);

      window.location.reload(); // Reload the page
    } catch (error) {
      console.error("Error saving company:", error);
      setMessage("Error occurred while saving company.");
      console.log("Updated message value:", message);
    } finally {
      // Reset the form
      setFormData({
        name: "",
        ip: "",
        port: "",
        veaamUsername: "",
        veaamPassword: "",
      });

      console.log("Form reset:", formData); // Debugging: Check form data after resetting
    }
  };

  console.log("Rendering message:", message); // Debugging: Check message value before rendering

  return (
    <div className="shadow-lg p-3 mb-5 bg-white rounded">
      <div>{message}</div>
      <div className="border border-dark border-3 mt-5">
        <div className="text-center py-3 position-relative d-flex align-items-center">
          <div className="flex-fill py-2 px-3 mx-1">
            <span className="fw-bold">Bedrijfsinformatie</span>
          </div>
        </div>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              name="ip"
              placeholder="Enter IP"
              value={formData.ip}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              name="port"
              placeholder="Enter port"
              value={formData.port}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              name="veaamUsername"
              placeholder="Enter Veeam username"
              value={formData.veaamUsername}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              name="veaamPassword"
              placeholder="Enter Veeam password"
              value={formData.veaamPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompanyADD;
