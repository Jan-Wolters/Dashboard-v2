import { useState } from "react";
import { Container, Button } from "react-bootstrap";
import CompanyAdd from "../MainParts/Company_Add";
import CompanySNMPAdd from "../MainParts/Company_AddSNMP";

function Company() {
  const [showCompanyForm, setShowCompanyForm] = useState(true);
  return (
    <Container className="py-5">
      <Button
        onClick={() => setShowCompanyForm(!showCompanyForm)}
        variant="secondary"
      >
        {showCompanyForm ? "Add SNMP Company" : "Add Company"}
      </Button>

      {showCompanyForm ? <CompanyAdd /> : <CompanySNMPAdd />}
    </Container>
  );
}

export default Company;
