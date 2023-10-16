import { useEffect, useState } from "react";
import { fetchData, Company } from "../../model/repositories.ts";
import StatusIcon from "../components/StatusIcon.tsx";

function Repo({ name }: { name: string }) {
  return <div>{name}</div>;
}

function Sess({ name }: { name: string }) {
  return <div>{name}</div>;
}

function CompanyComponent({ name, repositories, sessions }: Company) {
  const [collapsed, setCollapsed] = useState(true);

  const sortedSessions = sessions
    .slice()
    .sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );

  return (
    <li
      onClick={() => setCollapsed(!collapsed)}
      className={`border border-dark text-center py-3 mt-2 position-relative d-flex align-items-center shadow-sm ${
        collapsed ? "collapsed-list-item" : ""
      }`}
    >
      <div className="d-flex flex-column w-100">
        <div className="d-flex justify-content-between align-items-center">
          <span className="w-100 w-md-25 py-2 px-3 mx-1 font-size">{name}</span>
          <div className="flex-fill py-2 px-3 mx-1">
            {sessions.length > 0 && (
              <StatusIcon resultMessage={sessions[0].resultResult} />
            )}
          </div>
          <div className="py-2 mx-1">
            {new Date(sortedSessions[0]?.endTime).toLocaleString()}
          </div>
        </div>

        {!collapsed && (
          <>
            <div className="my-3">
              <h2>Repositories:</h2>
              <ul className="list-group d-flex flex-wrap">
                {repositories.map((repo, i) => (
                  <li key={i} className="list-group-item d-flex flex-column">
                    <Repo name={repo.name} />
                    <div className="progress mt-2">
                      {repo.capacityGB > 0 ? (
                        <div
                          className={`progress-bar ${
                            repo.usedSpaceGB / repo.capacityGB >= 0.95
                              ? "bg-danger"
                              : repo.usedSpaceGB / repo.capacityGB >= 0.75
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          role="progressbar"
                          aria-valuenow={repo.usedSpaceGB}
                          aria-valuemin={0}
                          aria-valuemax={repo.capacityGB}
                          style={{
                            width: `${
                              (repo.usedSpaceGB / repo.capacityGB) * 100
                            }%`,
                          }}
                        >
                          {((repo.usedSpaceGB / repo.capacityGB) * 100).toFixed(
                            2
                          )}
                          %
                        </div>
                      ) : (
                        <div
                          className="progress-bar bg-secondary"
                          role="progressbar"
                        >
                          N/A
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="my-3">
              <h2>Sessions:</h2>
              <ul className="list-group d-flex flex-wrap">
                {sortedSessions.map((session, i) => (
                  <li key={i} className="list-group-item">
                    <div className="row">
                      <div className="col-md-4">
                        <Sess name={session.name} />
                        <div className="d-flex flex-column">
                          <div className="py-2">
                            <StatusIcon resultMessage={session.resultResult} />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div
                          className="py-2 mx-4"
                          style={{ maxWidth: "300px" }}
                        >
                          {session.resultMessage}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="py-2 mx-1">
                          {new Date(session.endTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
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

        const failedCompany = fetchedCompanies.find(
          (company) =>
            company.sessions[0].resultResult === "Failed" ||
            company.sessions[0].resultResult === "Warning"
        );

        if (failedCompany) {
          setError(
            new Error(
              `${failedCompany.name} - ${failedCompany.sessions[0].resultResult}: ${failedCompany.sessions[0].resultMessage}`
            )
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error as Error);
      }
    };
    fetchCompanies();
  }, []);

  const priorityOrder: { [key: string]: number } = {
    Success: 2,
    Warning: 1,
    Failed: 0,
  };

  const filteredCompanies = companies
    .slice()
    .sort(
      (a, b) =>
        priorityOrder[a.sessions[0].resultResult] -
        priorityOrder[b.sessions[0].resultResult]
    );

  return (
    <div id="top" className="shadow-lg p-3 mb-5 bg-white rounded">
      <div id="List" className="d-fill">
        {error && (
          <div className="alert alert-danger">
            <h1>foutmeldingen:</h1>
            {error.message && (
              <h6 className="border-bottom border-dark py-2 px-1">
                {error.message}
              </h6>
            )}
          </div>
        )}
        {filteredCompanies.length === 0 ? (
          <p className="text-center">Niks gevonden</p>
        ) : (
          <div>
            <div className="row row-cols-1 row-cols-md-2">
              {filteredCompanies.map((company, i) => (
                <div key={i} className="col mb-4">
                  <CompanyComponent {...company} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyGroup;
