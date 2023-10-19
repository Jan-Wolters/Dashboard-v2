import Login from "../MainParts/login";

function CompanyLOG({ onLogin }: { onLogin: (token: string) => void }) {
  return (
    <div
      className={`w-auto overflow-hidden shadow-lg ${
        window.innerWidth < 768 ? "mx-1" : "mx-md-5"
      }`}
    >
      <Login onLogin={onLogin} />{" "}
      {/* Pass onLogin as a prop to the Login component */}
    </div>
  );
}

export default CompanyLOG;
