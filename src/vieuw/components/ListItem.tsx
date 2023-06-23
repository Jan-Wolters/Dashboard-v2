import { useState } from "react";
import StatusIcon from "./StatusIcon";

interface ListItemProps {
  item: string;
  statusB: string;
  statusN: string;
  LastBackUp: string;
  repositories: Repository[];
  formattedSessions: Sessions[];
}

function ListItem({
  item,
  statusB,
  statusN,
  LastBackUp,
  repositories,
  formattedSessions,
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
          <li>
            <div className="border border-dark mt-2">
              <div>
                <h1>session</h1>
              </div>
              {formattedSessions.map((session) => (
                <div
                  className={`text-center py-3 mt-2 position-relative d-flex align-items-center`}
                  key={session.id}
                >
                  <div className="d-flex flex-fill">
                    <span className="w-25 py-2 mx-1 fw-bold">
                      {session.name}
                    </span>
                    <div className="flex-fill py-2 mx-1">{session.endTime}</div>
                    <div className="flex-fill py-2 mx-1">{session.id}</div>
                    <div className="flex-fill py-2 mx-1">
                      {" "}
                      <StatusIcon resultMessage={session.resultMessage} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </li>
        )}
      </div>
    </li>
  );
}

export { ListItem };
