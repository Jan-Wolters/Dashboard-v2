import { useState } from "react";

interface ListItemProps {
  item: string;
  statusB: boolean;
  statusN: boolean;
  LastBackUp: string;
  repositories: Repository[];
}

function ListItem({
  item,
  statusB,
  statusN,
  LastBackUp,
  repositories,
}: ListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusClass = (status: boolean) => {
    return status ? "bg-success" : "bg-danger";
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className={`bi bi-square text-dark ${getStatusClass(statusB)}`}
              viewBox="0 0 16 16"
            >
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
            </svg>
          </div>
          <div className="flex-fill py-2 mx-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className={`bi bi-square text-dark ${getStatusClass(statusN)}`}
              viewBox="0 0 16 16"
            >
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
            </svg>
          </div>
          <div className="flex-fill">{LastBackUp}</div>
        </div>
        {isExpanded && (
          <ul className="list-group">
            <li className="list-group-item border-red">
              {" "}
              <div>
                <h1>back-up</h1>
              </div>
              {repositories.map((repository) => (
                <div key={repository.id}>
                  <div>
                    <span>{repository.name}</span>
                  </div>
                  <div>
                    <span>
                      <strong>capacityGB =</strong>
                      {repository.capacityGB}
                    </span>
                    <span>
                      {" "}
                      <strong>capacityGB =</strong>
                      {repository.freeGB}
                    </span>

                    <span>
                      {" "}
                      <strong>capacityGB =</strong>
                      {repository.usedSpaceGB}
                    </span>
                  </div>
                </div>
              ))}
            </li>
          </ul>
        )}
      </div>
    </li>
  );
}

export { ListItem };
