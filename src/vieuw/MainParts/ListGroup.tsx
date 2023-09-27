import { useEffect, useState } from "react";
import { fetchData, Company, Repository, Session } from "../../model/repositories.ts";
import React from "react";

function Repo({ name }: Repository)
{
  return (
    <div>
      {name}
    </div>
  );
}

function Sess({ name }: Session)
{
  return <div>{name}</div>;
}

function CompanyComponent({ name, repositories, sessions }: Company)
{
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <li onClick={() => setCollapsed(!collapsed)} >
      <h1>{name}</h1>
      <div style={{ display: collapsed ? "none" : "block" }}>
        <h1>Repositories:</h1>
        {repositories.map((repo, i) => <Repo key={i} {...repo} />)}
        <h1>Sessions:</h1>
        {sessions.map((session, i) => <Sess key={i} {...session} />)}
      </div>
    </li>
  );
}

function CompanyGroup() {
  const [companies, setCompanies] = useState([] as Company[]);
  const [error, setError] = useState<null | Error>(null);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const fetchedCompanies = await fetchData();
        setCompanies(fetchedCompanies);
        throw new Error("whoops!");
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error as Error);
      }
    };
    fetchCompanies()
  }, []);

  return (
    <div id="top" className="shadow-lg p-3 mb-5 bg-white rounded">
      <div id="List" className="d-fill">
        {error && <h1>{error.name} - {error.message}</h1>}
        {companies.length === 0 ? (
          <p className="text-center">Niks gevonden</p>
        ) : (
          <div>
            <ul className="list-group">
              {companies.map((company, i) => (
                <CompanyComponent key={i} {...company}/>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyGroup;