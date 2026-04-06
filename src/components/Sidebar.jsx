import React from "react";
import { useApp } from "../context/AppContext";

const NAV = [
  { id: "overview", icon: "⬡", label: "Overview" },
  { id: "transactions", icon: "↕", label: "Transactions" },
  { id: "insights", icon: "◈", label: "Insights" },
];

export default function Sidebar({ activePage, setActivePage }) {
  const { role, setRole, darkMode, setDarkMode } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">💰</div>
        <span className="logo-text">TrackEx</span>
      </div>

      <nav>
        {NAV.map(n => (
          <div
            key={n.id}
            className={`nav-item ${activePage === n.id ? "active" : ""}`}
            onClick={() => setActivePage(n.id)}
          >
            <span style={{ fontSize: "1.1rem" }}>{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text3)", marginBottom: 6 }}>
            Role
          </div>
          <select className="role-selector" value={role} onChange={e => setRole(e.target.value)}>
            <option value="viewer">👁 Viewer</option>
            <option value="admin">🔑 Admin</option>
          </select>
        </div>
        <div className="dark-toggle" onClick={() => setDarkMode(d => !d)}>
          <span>{darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
          <div className={`toggle-switch ${darkMode ? "on" : ""}`} />
        </div>
      </div>
    </aside>
  );
}
