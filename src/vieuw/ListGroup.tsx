import React, { useEffect, useState } from "react";
import { ListItem } from "./components/ListItem";
import { fetchData, saveCompany, Company } from "../model/repositories";

function ListGroup() {
  const [companies, setCompanies] = useState([] as Company[]);

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const fetchedCompanies = await fetchData();
        setCompanies(fetchedCompanies);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataAsync();
  }, []);

  const handleSaveCompany = async (companyData: any) => {
    try {
      await saveCompany(companyData);
      const fetchedCompanies = await fetchData();
      setCompanies(fetchedCompanies);
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  return (
    <div id="top" className="shadow-lg p-3 mb-5 bg-white rounded">
      <div id="head" className="border border-dark border-3 mt-5">
        <div className="text-center py-3 position-relative d-flex align-items-center">
          <div className="flex-fill  py-2 px-3 mx-1">
            <span className="fw-bold">bedrijfnaam</span>
          </div>
          <div className="flex-fill  py-2 mx-1">
            <span className="fw-bold">Backup Status</span>
          </div>
          <div className="flex-fill  py-2 mx-1">
            <span className="fw-bold">Last Backup</span>
          </div>
        </div>
      </div>
      <div id="List" className="d-fill">
        {companies.length === 0 ? (
          <p className="text-center">Niks gevonden</p>
        ) : (
          <ul className="list-group">
            {companies.map((company) => (
              <ListItem
                key={company.company_id}
                company_id={company.company_id}
                company_name={company.company_name}
                repository_id={company.repository_id}
                repository_name={company.repository_name}
                repository_description={company.repository_description}
                repository_hostId={company.repository_hostId}
                repository_hostName={company.repository_hostName}
                repository_path={company.repository_path}
                repository_capacityGB={company.repository_capacityGB}
                repository_freeGB={company.repository_freeGB}
                repository_usedSpaceGB={company.repository_usedSpaceGB}
                session_id={company.session_id}
                session_name={company.session_name}
                session_endTime={company.session_endTime}
                session_resultResult={company.session_resultResult}
                session_resultMessage={company.session_resultMessage}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ListGroup;
