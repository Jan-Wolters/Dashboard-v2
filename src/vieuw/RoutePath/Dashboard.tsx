import { useEffect, useState } from "react";
import CompanyGroup from "../MainParts/ListGroup.tsx";

function Dashboard() {
  const [statusContent, setStatusContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Make an HTTP request to fetch the status content
    fetch("/checkStatus")
      .then((response) => {
        if (response.status === 200) {
          // If the status code is 200, set "Success" as the status content
          setStatusContent("online");
        } else if (response.ok) {
          // If the response is OK but not 200, set the content from the response
          return response.text();
        } else {
          throw new Error("Failed to fetch status");
        }
      })
      .then((data) => {
        if (data !== undefined) {
          setStatusContent(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching status:", error);
        // Handle errors or display an error message
        const errorMessage = error.message || "Failed to retrieve status";
        setStatusContent(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div
      className={`w-auto overflow-hidden shadow-lg ${
        window.innerWidth < 768 ? "mx-1" : "mx-md-5"
      }`}
    >
      {" "}
      <CompanyGroup />
      {loading ? (
        <p>Loading...</p>
      ) : (
        statusContent !== null && <p>Status 3CX: {statusContent}</p>
      )}
    </div>
  );
}

export default Dashboard;
