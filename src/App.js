import * as React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import DashboardApp from "./modules/dashboardapp";
import ConfigApp from "./modules/configapp";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<DashboardApp />} />
        <Route path="config" element={<ConfigApp />} />
      </Routes>
    </div>
  );
}


export default App;