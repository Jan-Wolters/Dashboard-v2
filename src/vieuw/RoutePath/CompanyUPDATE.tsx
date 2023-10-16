import Company_update from "../MainParts/Company_Update";

function CompanyUP() {
  return (
    <div
      className={`w-auto overflow-hidden shadow-lg ${
        window.innerWidth < 768 ? "mx-1" : "mx-md-5"
      }`}
    >
      <Company_update />
    </div>
  );
}

export default CompanyUP;
