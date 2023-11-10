import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Alert, Form, Button, Container } from "react-bootstrap";
import axios from "axios";

// Define an interface for SNMP company data
interface SNMPCompany {
  company_id: string;
  ip: string;
  port: string;
  community: string;
  type: string;
}

// Define an interface for company data from your API
interface CompanyData {
  company_id: string; // Adjust the type to match your data
  name: string; // Adjust the type to match your data
  // Define other fields as needed
}

function CompanySNMPAdd() {
  const [snmpFormData, setSNMPFormData] = useState<SNMPCompany>({
    company_id: "0",
    ip: "",
    port: "",
    community: "",
    type: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]); // Array to hold companies

  useEffect(() => {
    // Fetch the list of companies from your API
    fetchCompanies()
      .then((companyData) => {
        setCompanies(companyData);
      })
      .catch((error) => {
        console.error("Error fetching company data:", error);
      });
  }, []);

  const fetchCompanies = async () => {
    const response = await axios.get("/Commag"); // Replace with your API endpoint
    console.log(response.data); // Add this line to log the data
    return response.data;
  };

  const handleSNMPChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSNMPFormData({
      ...snmpFormData,
      [name]: value,
    });
  };

  const handleSNMPSave = async (event: FormEvent) => {
    event.preventDefault();

    if (
      snmpFormData.company_id === "0" ||
      snmpFormData.ip === "" ||
      snmpFormData.port === "" ||
      snmpFormData.community === "" ||
      snmpFormData.type === ""
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setMessage("Saving...");
      await saveSNMPCompany(snmpFormData);
      setMessage("SNMP Company saved successfully");

      // Clear the form fields
      setSNMPFormData({
        company_id: "0",
        ip: "",
        port: "",
        community: "",
        type: "",
      });
    } catch (error) {
      setMessage("An error occurred while saving SNMP company.");
      console.error("Error saving SNMP company:", error);
    }
  };

  const saveSNMPCompany = async (data: SNMPCompany) => {
    try {
      const response = await axios.post("/SNMPCompany", data); // Replace with your API endpoint
      return response.data;
    } catch (error) {
      console.error("Error saving SNMP company:", error);
      throw error;
    }
  };

  return (
    <Container className="p-4 border border-dark py-5 my-5">
      <h2 className="mb-4">Add SNMP Company</h2>
      {message && (
        <Alert variant={message.startsWith("Error") ? "danger" : "success"}>
          {message}
        </Alert>
      )}

      <Form onSubmit={handleSNMPSave}>
        <Form.Group className="mb-3">
          <Form.Label>Select Company</Form.Label>
          <Form.Control
            as="select"
            name="company_id"
            value={snmpFormData.company_id}
            onChange={handleSNMPChange}
          >
            <option value="0">Select a Company</option>
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>IP Address</Form.Label>
          <Form.Control
            type="text"
            name="ip"
            placeholder="Enter IP"
            value={snmpFormData.ip}
            onChange={handleSNMPChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Port</Form.Label>
          <Form.Control
            type="text"
            name="port"
            placeholder="Enter Port"
            value={snmpFormData.port}
            onChange={handleSNMPChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Community</Form.Label>
          <Form.Control
            type="text"
            name="community"
            placeholder="Enter Community"
            value={snmpFormData.community}
            onChange={handleSNMPChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Control
            type="text"
            name="type"
            placeholder="Enter Type"
            value={snmpFormData.type}
            onChange={handleSNMPChange}
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Save SNMP Company
        </Button>
      </Form>
    </Container>
  );
}

export default CompanySNMPAdd;
