import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Alert, Form, Button, Container } from "react-bootstrap";

interface FormData {
  name: string;
  ip: string;
  port: string;
  veaamUsername: string;
  veaamPassword: string;
}

function CompanyAdd() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    ip: "",
    port: "",
    veaamUsername: "",
    veaamPassword: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const ip = "localhost";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setMessage(null); // Clear the error message
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Check if any of the fields are empty
    if (
      !formData.name ||
      !formData.ip ||
      !formData.port ||
      !formData.veaamUsername ||
      !formData.veaamPassword
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setMessage("Saving...");
      await saveCompany(formData);
      setMessage("Company saved successfully");

      setFormData({
        name: "",
        ip: "",
        port: "",
        veaamUsername: "",
        veaamPassword: "",
      });
    } catch (error) {
      setMessage("An error occurred while saving company.");
      console.error("Error saving company:", error);
    }
  };

  const saveCompany = async (formData: FormData) => {
    try {
      const response = await axios.post(
        `http://${ip}:8080/companies`,
        formData
      );
      return response.data;
    } catch (error) {
      console.error("Error saving company:", error);
      throw error;
    }
  };

  return (
    <Container className="p-4 border border-dark py-5 my-5">
      <h2 className="mb-4">bedrijf toevoegen</h2>
      {message && (
        <Alert variant={message.startsWith("Error") ? "succes" : "danger"}>
          {message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter name"
            value={formData.name}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>IP Address</Form.Label>
          <Form.Control
            type="text"
            name="ip"
            placeholder="Enter IP"
            value={formData.ip}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Port</Form.Label>
          <Form.Control
            type="text"
            name="port"
            placeholder="Enter port"
            value={formData.port}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Veeam Username</Form.Label>
          <Form.Control
            type="text"
            name="veaamUsername"
            placeholder="Enter Veeam username"
            value={formData.veaamUsername}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Veeam Password</Form.Label>
          <Form.Control
            type="text"
            name="veaamPassword"
            placeholder="Enter Veeam password"
            value={formData.veaamPassword}
            onChange={handleChange}
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Save
        </Button>
      </Form>
    </Container>
  );
}

export default CompanyAdd;
