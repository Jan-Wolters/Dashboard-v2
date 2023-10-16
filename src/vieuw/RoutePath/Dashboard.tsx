import CompanyGroup from "../MainParts/ListGroup.tsx";

function Dashboard() {
  return (
    <div
      className={`w-auto overflow-hidden shadow-lg ${
        window.innerWidth < 768 ? "mx-1" : "mx-md-5"
      }`}
    >
      <CompanyGroup />
    </div>
  );
}

export default Dashboard;
