import React, { useEffect, useState } from "react";
import { ListItem } from "./components/ListItem";
import {
  Repository,
  Sessions,
  Backup,
  fetchData,
} from "../model/repositories.tsx";
import StatusMessage from "./components/Message.tsx"; // Import the StatusMessage component

function ListGroup() {
  const initialBedrijf = [
    {
      name: "Schoonderwolf Diensten BV",
      LastBackUp: "16-05-2023",
    },
  ];
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [sessions, setSessions] = useState<Sessions[]>([]);
  const [backup, setBackup] = useState<Backup[]>([]);

  useEffect(() => {
    const fetchDataAsync = async () => {
      const [fetchedRepositories, fetchedSessions, fetchedBackup] =
        await fetchData();
      setRepositories(fetchedRepositories);
      setSessions(fetchedSessions);
      setBackup(fetchedBackup);
    };

    fetchDataAsync();
  }, []);

  return (
    <div id="top" className="shadow-lg p-3 mb-5 bg-white rounded">
      <div>
        {" "}
        <StatusMessage sessions={sessions} />
      </div>
      <div id="head" className="border border-dark border border-3 mt-5">
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
        {repositories.length === 0 ? (
          <p className="text-center">Niks gevonden</p>
        ) : (
          <ul className="list-group">
            {initialBedrijf.map((item) => {
              const session = sessions.find(
                (session) => session.name === item.name
              );
              const resultResult = session?.resultResult;

              return (
                <ListItem
                  key={item.name}
                  item={item.name}
                  LastBackUp={item.LastBackUp}
                  repositories={repositories}
                  formattedSessions={sessions}
                  formattedBackup={backup}
                ></ListItem>
              );
            })}
          </ul>
        )}
      </div>{" "}
      {/* Render the StatusMessage component */}
    </div>
  );
}

export default ListGroup;
