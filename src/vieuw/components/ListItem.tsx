import React, { useState } from "react";
import StatusIcon from "./StatusIcon";

interface ListItemProps {
  item: string;
  statusB: string;
  statusN: string;
  LastBackUp: string;
  repositories: Repository[];
  formattedSessions: Sessions[];
  formattedBackup: Backup[];
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

interface Backup {
  id: number;
  platformName: string;
  name: string;
  creationTime: Date;
}

function ListItem({
  item,
  statusB,
  statusN,
  LastBackUp,
  repositories,
  formattedSessions,
  formattedBackup,
}: ListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <li>
      <div className="">
        <div
          className={`border border-dark text-center py-3 mt-2 position-relative d-flex align-items-center`}
          onClick={handleClick}
        >
          <span className="w-25 py-2 mx-1">{item}</span>
          <div className="flex-fill py-2 mx-1">
            <StatusIcon resultMessage={statusB} />
          </div>
          <div className="flex-fill py-2 mx-1">
            <StatusIcon resultMessage={statusN} />
          </div>
          <div className="flex-fill">{LastBackUp}</div>
        </div>
        {isExpanded && (
          <div className="mx-auto" style={{ maxWidth: "95%" }}>
            <div className="border border-dark mt-2 mx-auto">
              <div>
                <h1>session</h1>
              </div>
              <ul
                className="list-group"
                style={{ overflowY: "auto", maxHeight: "750px" }}
              >
                {" "}
                {/* Added list-group class */}
                {formattedSessions.map((session) => {
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
                          <StatusIcon resultMessage={session.resultResult} />
                        </div>{" "}
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
                })}
              </ul>
            </div>
            <div className="border border-dark mt-2">
              <div>
                <h1>Repository</h1>
              </div>
              <ul className="list-group">
                {" "}
                {/* Added list-group class */}
                {repositories.map((repository) => {
                  const progressValue =
                    (repository.usedSpaceGB / repository.capacityGB) * 100;

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
                          capacity = {repository.capacityGB}GB
                        </div>
                        <div className="flex-fill py-2 mx-1">
                          usedSpace = {repository.usedSpaceGB}GB
                        </div>
                        <div className="flex-fill py-2 mx-1">
                          freespace ={repository.freeGB}GB
                        </div>

                        <div className="flex-fill py-2 mx-1">
                          <div className="progress">
                            <div
                              className="progress-bar"
                              role="progressbar"
                              aria-valuenow={progressValue}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              style={{ width: `${progressValue}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

export { ListItem };
