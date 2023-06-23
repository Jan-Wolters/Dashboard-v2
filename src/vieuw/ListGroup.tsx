import React, { useEffect, useState } from "react";
import { ListItem } from "./components/ListItem";

interface Repository {
  name: string;
  id: number;
  capacityGB: number;
  freeGB: number;
  usedSpaceGB: number;
}
///////////////////////////////////////////////////////////////////////
interface Sessions {
  ids: number;
  names: string;
  endTime: Date;
  resultResult: string;
  resultMessage: string;
}

function ListGroup() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [sessions, setSessions] = useState<Sessions[]>([]);

  const initialBedrijf = [
    {
      name: "Schoonderwolf Diensten BV",
      statusB: "Success",
      statusN: "Failed",
      LastBackUp: "16-05-2023",
    },
  ];

  const [bedrijf, setBedrijf] = useState(initialBedrijf);
  const [allSuccess, setAllSuccess] = useState(false);
  const [warningMessages, setWarningMessages] = useState<string[]>([]);
  const [dangerItems, setDangerItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repositoriesData, sessionsData] = await Promise.all([
          fetchRepositories(),
          fetchSessions(),
        ]);
        setRepositories(repositoriesData);
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sortBedrijf = (bedrijfArray: any[]) => {
      return bedrijfArray.sort((a, b) => {
        const aFailCount = (a.statusB ? 0 : 1) + (a.statusN ? 0 : 1);
        const bFailCount = (b.statusB ? 0 : 1) + (b.statusN ? 0 : 1);

        if (aFailCount === bFailCount) {
          return 0;
        } else if (aFailCount === 2 || bFailCount === 0) {
          return -1;
        } else if (aFailCount === 0 || bFailCount === 2) {
          return 1;
        } else {
          return aFailCount - bFailCount;
        }
      });
    };

    const checkAllSuccess = (bedrijfArray: any[]) => {
      const sortedBedrijf = sortBedrijf(bedrijfArray);

      const warningItems = sortedBedrijf.filter(
        (item) =>
          (!item.statusB && item.statusN) || (item.statusB && !item.statusN)
      );

      const dangerItems = sortedBedrijf.filter(
        (item) => !item.statusB && !item.statusN
      );

      if (warningItems.length > 0) {
        const messages = warningItems.map((item) => {
          if (!item.statusB && item.statusN) {
            return `${item.name} heeft een Netwerk probleem.`;
          } else if (item.statusB && !item.statusN) {
            return `${item.name} heeft een Backup probleem.`;
          }
        });

        setWarningMessages(messages.filter(Boolean));
      } else {
        setWarningMessages([]);
      }

      setDangerItems(dangerItems);

      return sortedBedrijf.every((item) => item.statusB && item.statusN);
    };

    setBedrijf((prevBedrijf) => {
      const sortedBedrijf = sortBedrijf(prevBedrijf);
      setAllSuccess(checkAllSuccess(sortedBedrijf));
      return sortedBedrijf;
    });
  }, []);

  const fetchRepositories = async (): Promise<Repository[]> => {
    try {
      const response = await fetch("http://localhost:3001/data");
      const jsonData = await response.json();

      const formattedData: Repository[] = jsonData.map((data: any) => ({
        name: data.name,
        id: data.id,
        capacityGB: data.capacityGB,
        freeGB: data.freeGB,
        usedSpaceGB: data.usedSpaceGB,
      }));

      return formattedData;
    } catch (error) {
      console.error("Error fetching repositories:", error);
      return [];
    }
  };

  const fetchSessions = async (): Promise<Sessions[]> => {
    try {
      const response = await fetch("http://localhost:3001/sessions");
      const jsonData = await response.json();

      const formattedSessions = jsonData.map((session: any) => ({
        id: session.id,
        name: session.name,
        endTime: session.endTime.toLocaleString(), // Format the Date object to a string
        resultResult: session.resultResult,
        resultMessage: session.resultMessage,
      }));

      return formattedSessions;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  };

  useEffect(() => {
    const sortBedrijf = (bedrijfArray: any[]) => {
      return bedrijfArray.sort((a, b) => {
        const aFailCount = (a.statusB ? 0 : 1) + (a.statusN ? 0 : 1);
        const bFailCount = (b.statusB ? 0 : 1) + (b.statusN ? 0 : 1);

        if (aFailCount === bFailCount) {
          return 0;
        } else if (aFailCount === 2 || bFailCount === 0) {
          return -1;
        } else if (aFailCount === 0 || bFailCount === 2) {
          return 1;
        } else {
          return aFailCount - bFailCount;
        }
      });
    };

    const checkAllSuccess = (bedrijfArray: any[]) => {
      const sortedBedrijf = sortBedrijf(bedrijfArray);

      const warningItems = sortedBedrijf.filter(
        (item) =>
          (!item.statusB && item.statusN) || (item.statusB && !item.statusN)
      );

      const dangerItems = sortedBedrijf.filter(
        (item) => !item.statusB && !item.statusN
      );

      if (warningItems.length > 0) {
        const messages = warningItems.map((item) => {
          if (!item.statusB && item.statusN) {
            return `${item.name} heeft een Netwerk probleem.`;
          } else if (item.statusB && !item.statusN) {
            return `${item.name} heeft een Backup probleem.`;
          }
        });

        setWarningMessages(messages.filter(Boolean));
      } else {
        setWarningMessages([]);
      }

      setDangerItems(dangerItems);

      return sortedBedrijf.every((item) => item.statusB && item.statusN);
    };

    setBedrijf((prevBedrijf) => {
      const sortedBedrijf = sortBedrijf(prevBedrijf);
      setAllSuccess(checkAllSuccess(sortedBedrijf));
      return sortedBedrijf;
    });
  }, []);

  return (
    <div id="top" className="shadow-lg p-3 mb-5 bg-white rounded">
      {dangerItems.length > 0 && (
        <div className="bg-danger">
          <div
            id="danger"
            className="border border-dark bg-danger text-center py-2"
          >
            <h4 className="fw-bold">Probleem:</h4>
            <div style={{ overflowY: "auto", maxHeight: "200px" }}>
              {dangerItems.map((item, index) => (
                <p
                  className="fw-bold"
                  key={index}
                >{`${item.name} heeft beide statussen als false.`}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {warningMessages.length > 0 && (
        <div className="bg-warning">
          <div
            id="warning"
            className="border border-dark bg-warning text-center py-2"
          >
            <h4 className="fw-bold">Warning:</h4>
            <div style={{ overflowY: "auto", maxHeight: "200px" }}>
              {warningMessages.map((message, index) => (
                <p className="fw-bold" key={index}>
                  {message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {(allSuccess || warningMessages.length === 0) &&
        dangerItems.length === 0 && (
          <div className="border border-dark bg-success text-center py-2">
            <h4>Alles is operationeel</h4>
          </div>
        )}

      <div id="head" className="border border-dark border border-3 mt-5">
        <div className="text-center py-3 position-relative d-flex align-items-center">
          <div className="flex-fill  py-2 px-3 mx-1">
            <span className="fw-bold">bedrijfnaam</span>
          </div>
          <div className="flex-fill  py-2 mx-1">
            <span className="fw-bold">Backup Status</span>
          </div>
          <div className="flex-fill  py-2 mx-1">
            <span className="fw-bold">Netwerk Status</span>
          </div>
          <div className="flex-fill  py-2 mx-1">
            <span className="fw-bold">Last Backup</span>
          </div>
        </div>
      </div>

      <div
        id="List"
        className="d-fill"
        style={{ overflowY: "auto", maxHeight: "750px" }}
      >
        {bedrijf.length === 0 ? (
          <p className="text-center">Niks gevonden</p>
        ) : (
          <ul className="list-group">
            {bedrijf.map((item) => (
              <ListItem
                key={item.name}
                item={item.name}
                statusB={item.statusB}
                statusN={item.statusN}
                LastBackUp={item.LastBackUp}
                repositories={repositories}
                formattedSessions={sessions}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Your repositories code goes here */}
    </div>
  );
}

export default ListGroup;
