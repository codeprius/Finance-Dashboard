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
            {role === "admin" && <span className="admin-badge">🔑 Admin</span>}
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
            {/* Search */}
            <div className="search-box">
              <span style={{ color: "var(--text3)", fontSize: "0.9rem" }}>🔍</span>
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Month filter */}
            <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            {/* Type filter */}
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            {/* Category filter */}
            <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            {/* Sort */}
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date-desc">Date ↓</option>
              <option value="date-asc">Date ↑</option>
              <option value="amount-desc">Amount ↓</option>
              <option value="amount-asc">Amount ↑</option>
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
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
                      <span className={`type-badge ${tx.type}`}>{tx.type === "income" ? "↑ Income" : "↓ Expense"}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`amount-cell ${tx.type}`}>
                        {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                      </span>
                    </td>
                    {role === "admin" && (
                      <td>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button className="action-btn" onClick={() => handleEdit(tx)} title="Edit">✏️</button>
                          <button className="action-btn delete" onClick={() => deleteTransaction(tx.id)} title="Delete">🗑</button>
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
