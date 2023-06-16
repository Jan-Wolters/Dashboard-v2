import { useState } from "react";
import { dbList } from "./DDListItem";

interface ListItemProps {
  item: string;
  statusB: boolean;
  statusN: boolean;
  LastBackUp: string;
}

function ListItem({ item, statusB, statusN, LastBackUp }: ListItemProps) {
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-caret-right-fill"
            viewBox="0 0 16 16"
          >
            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
          </svg>
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
        {isExpanded && <div>{dbList()}</div>}
      </div>
    </li>
  );
}

export { ListItem };

/*import { useState } from "react";

interface ListItemProps {
  item: string;
  statusB: boolean;
  statusN: boolean;
  LastBackUp: string;
}

function ListItem({ item, statusB, statusN, LastBackUp }: ListItemProps) {
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
          <ul className="list-group position-relative">
            <li className="list-group-item">
              <div className="border border-dark mx-auto w-100 position-relative">
                f
                <div className="bg-danger position-absolute top-0 start-0">
                  <div className="border border-dark">1</div>
                </div>
                <div className="bg-danger position-absolute top-0 start-50 translate-middle-x">
                  <div className="border border-dark">d</div>
                </div>
                <div className="bg-danger position-absolute top-0 end-0">
                  <div className="border border-dark">3</div>
                </div>
                <div className="bg-danger position-absolute top-50 start-0 translate-middle-y">
                  <div className="border border-dark">3</div>
                </div>
                <div className="bg-danger position-absolute top-50 start-50 translate-middle">
                  <div className="border border-dark">4</div>
                </div>
                <div className="bg-danger position-absolute top-50 end-0 translate-middle-y">
                  <div className="border border-dark">5</div>
                </div>
                <div className="bg-danger position-absolute bottom-0 start-0">
                  <div className="border border-dark">6</div>
                </div>
                <div className="bg-danger position-absolute bottom-0 start-50 translate-middle-x">
                  <div className="border border-dark">7</div>
                </div>
                <div className="bg-danger position-absolute bottom-0 end-0">
                  <div className="border border-dark">8</div>
                </div>
              </div>
            </li>
          </ul>
        )}
      </div>
    </li>
  );
}

export { ListItem };*/
