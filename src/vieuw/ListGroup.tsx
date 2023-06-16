import { ListItem } from "./components/ListItem";
import { useEffect, useState } from "react";

function ListGroup() {
  const initialBedrijf = [
    {
      name: "Schoonderwolf Diensten BV",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
    {
      name: "Milin",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },

    {
      name: "Galvano Holding BV",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
    {
      name: "Polytech Holding BV",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
    {
      name: "Fenix Industries BV",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
    {
      name: "Bear Optima Wood",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
    {
      name: "Profilelaser",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
    {
      name: "Metaalbewerkingsbedrijf De Vries BV",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
    {
      name: "Seine Metaal BV",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
    {
      name: "REA Industrie en Handelsonderneming",
      statusB: true,
      statusN: true,
      LastBackUp: "16-05-2023",
    },
  ];

  const [Bedrijf, setBedrijf] = useState(initialBedrijf);
  const [allSuccess, setAllSuccess] = useState(false);
  const [warningMessages, setWarningMessages] = useState([]);
  const [dangerItems, setDangerItems] = useState([]);

  useEffect(() => {
    const sortBedrijf = (bedrijfArray) => {
      return bedrijfArray.sort((a, b) => {
        const aFailCount = (a.statusB ? 0 : 1) + (a.statusN ? 0 : 1);
        const bFailCount = (b.statusB ? 0 : 1) + (b.statusN ? 0 : 1);

        if (aFailCount === bFailCount) {
          return 0; // Leave items with equal fail count in their original order
        } else if (aFailCount === 2 || bFailCount === 0) {
          return -1; // Put items with both statusB and statusN as false at the top
        } else if (aFailCount === 0 || bFailCount === 2) {
          return 1; // Put items with both statusB and statusN as true at the bottom
        } else {
          return aFailCount - bFailCount; // Sort the rest based on fail count
        }
      });
    };

    const checkAllSuccess = () => {
      const sortedBedrijf = sortBedrijf(Bedrijf);

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

        setWarningMessages(messages.filter(Boolean)); // Filter out undefined messages
      } else {
        setWarningMessages([]);
      }

      setDangerItems(dangerItems);

      return sortedBedrijf.every((item) => item.statusB && item.statusN); // Check if both statusB and statusN are true for all items
    };

    setBedrijf(sortBedrijf(initialBedrijf));
    setAllSuccess(checkAllSuccess());
  }, [Bedrijf, initialBedrijf]);

  return (
    <div id="top" className="shadow-lg p-3 mb-5 bg-white rounded">
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
          {Bedrijf.length === 0 ? (
            <p className="text-center">Niks gevonden</p>
          ) : (
            <ul className="list-group">
              {Bedrijf.map((item) => (
                <ListItem
                  key={item.name}
                  item={item.name}
                  statusB={item.statusB}
                  statusN={item.statusN}
                  LastBackUp={item.LastBackUp}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListGroup;
