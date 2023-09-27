import { useState } from "react";
import StatusIcon from "./StatusIcon";
import { Company } from "../../model/repositories";

function ListItem({ company_name, repositories, sessions }: Company) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const renderLatestRecordStatusAndDate = () => {
    if (!sessions || sessions.length === 0) {
      return null;
    }

    // Get the latest record
    const latestRecord = sessions[0];

    return (
      <div className="d-flex flex-fill">
        <div className="flex-fill py-2 px-3 mx-1">
          <StatusIcon resultMessage={latestRecord.sessions_resultResult} />
        </div>
        <div style={{ width: "300px" }}>
          <div className="py-2 mx-1 ">
            {/* Format record end time */}
            {new Date(latestRecord.sessions_endTime).toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <li>
      <div
        className={`border border-dark text-center py-3 mt-2 position-relative d-flex align-items-center shadow-sm`}
        onClick={handleClick}
      >
        <span className="w-25 py-2 px-3 mx-1">{company_name}</span>
        {renderLatestRecordStatusAndDate()}
      </div>

      {isExpanded && (
        <div className="mx-auto" style={{ maxWidth: "95%" }}>
          {sessions && sessions.length > 0 && (
            <div className="border border-dark mt-2 mx-auto">
              <div>
                <h1>Sessions</h1>
              </div>
              <ul
                className="list-group"
                style={{ overflowY: "auto", maxHeight: "750px" }}
              >
                {sessions.map((sessions) => (
                  <li
                    className={`text-center py-3 mt-2 position-relative d-flex align-items-center list-group-item`}
                    key={sessions.sessions_id}
                  >
                    <div className="d-flex flex-fill">
                      <span className="w-25 py-2 mx-1 fw-bold">
                        {sessions.sessions_name}
                      </span>
                      <div className="flex-fill py-2 mx-1">
                        <StatusIcon
                          resultMessage={sessions.sessions_resultResult}
                        />
                      </div>
                      <div
                        className="flex-fill py-2 mx-4"
                        style={{ maxWidth: "300px" }}
                      >
                        {sessions.sessions_resultMessage}
                      </div>
                      <div style={{ width: "300px" }}>
                        <div className="py-2 mx-1 ">
                          {/* Format record end time */}
                          {new Date(sessions.sessions_endTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {repositories && repositories.length > 0 && (
            <div className="border border-dark mt-2">
              <div>
                <h1>Repositories</h1>
              </div>
              <ul className="list-group">
                {repositories.map((repository) => (
                  <li
                    className={`text-center py-3 mt-2 position-relative d-flex align-items-center list-group-item`}
                    key={repository.repository_id}
                  >
                    <div className="d-flex flex-fill">
                      <span className="w-25 py-2 mx-1 fw-bold">
                        {repository.repository_name}
                      </span>
                      <div className="flex-fill py-2 mx-1">
                        <div className="progress">
                          {repository.repository_capacityGB > 0 ? (
                            <div
                              className={`progress-bar ${repository.repository_usedSpaceGB /
                                  repository.repository_capacityGB >=
                                  0.95
                                  ? "bg-danger"
                                  : repository.repository_usedSpaceGB /
                                    repository.repository_capacityGB >=
                                    0.75
                                    ? "bg-warning"
                                    : ""
                                }`}
                              role="progressbar"
                              aria-valuenow={repository.repository_usedSpaceGB}
                              aria-valuemin={0}
                              aria-valuemax={repository.repository_capacityGB}
                              style={{
                                width: `${(repository.repository_usedSpaceGB /
                                    repository.repository_capacityGB) *
                                  100
                                  }%`,
                              }}
                            >
                              {(
                                (repository.repository_usedSpaceGB /
                                  repository.repository_capacityGB) *
                                100
                              ).toFixed(2)}
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
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export { ListItem };
