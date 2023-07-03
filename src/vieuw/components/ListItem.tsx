import React, { useState } from "react";
import StatusIcon from "./StatusIcon";

interface ListItemProps {
  item: string;
  statusB: string;
  statusN: string;
  LastBackUp: string;
  repositories: Repository[];
  formattedSessions: Sessions[];
  repositoriespro: Repository[];
  sessionspro: Sessions[];
}

interface Repository {
  name: string;
  id: number;
  capacityGB: number;
  freeGB: number;
  usedSpaceGB: number;
}

interface Sessions {
  id: number;
  name: string;
  endTime: Date;
  resultResult: string;
  resultMessage: string;
}

function ListItem({
  item,
  statusB,
  statusN,
  LastBackUp,
  repositories,
  formattedSessions,
  repositoriespro,
  sessionspro,
}: ListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldDisplaySessions = item === "heering" || item === "Profile Laser";
  const shouldDisplayRepositories =
    item === "heering" || item === "Profile Laser";

  return (
    <li>
      <div className="">
        <div
          className={`border border-dark text-center py-3 mt-2 position-relative d-flex align-items-center`}
          onClick={handleClick}
        >
          <span className="w-25 py-2 mx-1">{item}</span>
          <div className="flex-fill py-2 mx-1">
            {shouldDisplaySessions && (
              <StatusIcon
                resultMessage={
                  (item === "heering"
                    ? formattedSessions[0].resultResult
                    : item === "Profile Laser"
                    ? sessionspro[0].resultResult
                    : "") || statusN
                }
              />
            )}
            {!shouldDisplaySessions && <StatusIcon resultMessage={statusB} />}
          </div>
          <div className="flex-fill py-2 mx-1">
            {shouldDisplaySessions && (
              <StatusIcon
                resultMessage={
                  (item === "heering"
                    ? formattedSessions[0].resultResult
                    : item === "Profile Laser"
                    ? sessionspro[0].resultResult
                    : "") || statusN
                }
              />
            )}
            {!shouldDisplaySessions && <StatusIcon resultMessage={statusN} />}
          </div>
          <div className="flex-fill">{LastBackUp}</div>
        </div>

        {isExpanded && (
          <div className="mx-auto" style={{ maxWidth: "95%" }}>
            {shouldDisplaySessions && (
              <div className="border border-dark mt-2 mx-auto">
                <div>
                  <h1>{item === "heering" ? "Sessions" : "Sessions"}</h1>
                </div>
                <ul
                  className="list-group"
                  style={{ overflowY: "auto", maxHeight: "750px" }}
                >
                  {(item === "heering" ? formattedSessions : sessionspro).map(
                    (session) => {
                      const endTimeString = session?.endTime?.toLocaleString();

                      return (
                        <li
                          className={`text-center py-3 mt-2 position-relative d-flex align-items-center list-group-item`}
                          key={session.id}
                        >
                          <div className="d-flex flex-fill">
                            <span className="w-25 py-2 mx-1 fw-bold">
                              {session.name}
                            </span>
                            <div className="flex-fill py-2 mx-1">
                              <StatusIcon
                                resultMessage={session.resultResult}
                              />
                            </div>
                            <div
                              className="flex-fill py-2 mx-4 border border-danger"
                              style={{ maxWidth: "300px" }}
                            >
                              {session.resultMessage}
                            </div>
                            <div style={{ width: "300px" }}>
                              <div className="py-2 mx-1 ">{endTimeString}</div>
                            </div>
                          </div>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            )}

            {shouldDisplayRepositories && (
              <div className="border border-dark mt-2">
                <div>
                  <h1>
                    {item === "heering"
                      ? "Repositories"
                      : item === "Profile Laser"
                      ? "Repositories"
                      : ""}
                  </h1>
                </div>
                <ul className="list-group">
                  {(item === "heering"
                    ? repositories
                    : item === "Profile Laser"
                    ? repositoriespro
                    : []
                  ).map((repository) => {
                    const progressValue = parseFloat(
                      (
                        (repository.usedSpaceGB / repository.capacityGB) *
                        100
                      ).toFixed(2)
                    );

                    const progressColor =
                      progressValue >= 90
                        ? "bg-danger"
                        : progressValue >= 75
                        ? "bg-warning"
                        : "";

                    return (
                      <li
                        className={`text-center py-3 mt-2 position-relative d-flex align-items-center list-group-item`}
                        key={repository.id}
                      >
                        <div className="d-flex flex-fill">
                          <span className="w-25 py-2 mx-1 fw-bold">
                            {repository.name}
                          </span>
                          <div className="flex-fill py-2 mx-1">
                            <div className="progress">
                              <div
                                className={`progress-bar ${progressColor}`}
                                role="progressbar"
                                aria-valuenow={progressValue}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{ width: `${progressValue}%` }}
                              >
                                {progressValue}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export { ListItem };
