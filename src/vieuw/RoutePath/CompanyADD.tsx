import CompanyAd from "../MainParts/Company_Add.tsx";

function Company() {
  return (
    <div
      className={`w-auto overflow-hidden shadow-lg ${
        window.innerWidth < 768 ? "mx-2" : "mx-md-5"
      }`}
    >
      <CompanyAd />{" "}
    </div>
  );
}

export default Company;
