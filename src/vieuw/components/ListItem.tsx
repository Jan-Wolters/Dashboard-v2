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
                {repositories.map((repository) => (
                  <li
                    className={`text-center py-3 mt-2 position-relative d-flex align-items-center list-group-item`}
                    key={repository.id}
                  >
                    <div className="d-flex flex-fill">
                      <span className="w-25 py-2 mx-1 fw-bold">
                        {repository.name}
                      </span>
                      <div className="flex-fill py-2 mx-1">
                        {repository.usedSpaceGB}
                      </div>
                      <div className="flex-fill py-2 mx-1">
                        {repository.capacityGB}
                      </div>
                      <div className="flex-fill py-2 mx-1">
                        {repository.freeGB}
                      </div>
                      <div className="flex-fill py-2 mx-1">
                        {repository.usedSpaceGB}
                      </div>
                      <div className="flex-fill py-2 mx-1"> {/*donut*/}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

export { ListItem };
