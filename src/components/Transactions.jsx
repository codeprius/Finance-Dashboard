import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORY_COLORS, CATEGORIES } from "../data/mockData";
import TransactionModal from "./TransactionModal";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const MONTHS = [
  { label: "All Time", value: "all" },
  { label: "January 2026", value: "2026-01" },
  { label: "February 2026", value: "2026-02" },
  { label: "March 2026", value: "2026-03" },
];

export default function Transactions() {
  const {
    filteredTransactions, deleteTransaction, role,
    filterMonth, setFilterMonth, filterType, setFilterType,
    filterCategory, setFilterCategory, searchQuery, setSearchQuery,
    sortBy, setSortBy,
  } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const handleEdit = (tx) => { setEditTx(tx); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditTx(null); };

  return (
    <div>
      <div className="page-header fade-in" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className="page-title">Transactions</h1>
            {role === "admin" && <span className="admin-badge">Admin</span>}
          </div>
          <p className="page-sub">{filteredTransactions.length} transactions found</p>
        </div>
        {role === "admin" && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Transaction
          </button>
        )}
      </div>

      <div className="transactions-card fade-in">
        <div className="tx-header">
          <span className="tx-title">All Transactions</span>
          <div className="filters-row">
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High)</option>
              <option value="amount-asc">Amount (Low)</option>
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-text">No transactions match your filters</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  {role === "admin" && <th style={{ textAlign: "center" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 500, color: "var(--text)" }}>{tx.description}</td>
                    <td style={{ color: "var(--text3)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                      {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                    <td>
                      <span className="category-badge">
                        <span className="category-dot" style={{ background: CATEGORY_COLORS[tx.category] || "#888" }} />
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <span className={`type-badge ${tx.type}`}>{tx.type === "income" ? "Income" : "Expense"}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`amount-cell ${tx.type}`}>
                        {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                      </span>
                    </td>
                    {role === "admin" && (
                      <td>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button className="action-btn" onClick={() => handleEdit(tx)} title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="action-btn delete" onClick={() => deleteTransaction(tx.id)} title="Delete">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <TransactionModal onClose={handleClose} editTx={editTx} />}
    </div>
  );
}
