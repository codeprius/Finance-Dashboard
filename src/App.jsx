import React, { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Transactions from "./components/Transactions";
import Insights from "./components/Insights";
import "./index.css";

function Dashboard() {
  const [activePage, setActivePage] = useState("overview");

  const renderPage = () => {
    if (activePage === "transactions") return <Transactions />;
    if (activePage === "insights") return <Insights />;
    return <Overview />;
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
