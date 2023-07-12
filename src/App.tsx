import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./vieuw/Dashboard.tsx";
import Comapny from "./vieuw/Company.tsx";

//import NavBar from "./components/NavBar.tsx";

function App() {
  return (
    <Router>
      <Routes>
        {" "}
        {/* Wrap your routes in the <Routes> component */}
        <Route path="/" element={<Dashboard />} />{" "}
        <Route path="Company" element={<Comapny />} />{" "}
        {/* Use the 'element' prop instead of 'component' */}
        {/*    <Route path="/navbar" element={<NavBar />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
