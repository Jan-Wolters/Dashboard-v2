import { useState, useEffect } from "react";
import {
  fetchDatacon,
  deleteCompany,
  CompanyList,
} from "../../model/repositories.ts";
import { Table, Button } from "react-bootstrap";

function Company_update() {
  const [companies, setCompanies] = useState<CompanyList[] | null>(null);

  const fetchCompanies = async () => {
    try {
      const fetchedCompanies = await fetchDatacon();
      setCompanies(fetchedCompanies);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async (companyId: number) => {
    try {
      await deleteCompany(companyId);
      // If the delete operation is successful, reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div id="top" className="shadow-lg p-3 mb-5 bg-white rounded">
      <div id="List" className="d-fill">
        {companies === null ? (
          <p className="text-center">Loading...</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Company ID</th>
                <th>Company Name</th>
                <th>IP Address</th>
                <th>Port</th>
                <th>Username</th>
                <th>Password</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.company_id}>
                  <td>{company.company_id}</td>
                  <td>{company.company_name}</td>
                  <td>{company.company_ip}</td>
                  <td>{company.company_port}</td>
                  <td>{company.veaamUsername}</td>
                  <td>{company.veaamPassword}</td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(company.company_id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default Company_update;
