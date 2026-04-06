import React, { useState, useEffect } from "react";
import { CATEGORIES } from "../data/mockData";
import { useApp } from "../context/AppContext";

export default function TransactionModal({ onClose, editTx }) {
  const { addTransaction, editTransaction } = useApp();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Food & Dining",
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (editTx) setForm({ ...editTx, amount: String(editTx.amount) });
  }, [editTx]);

  const handleSubmit = () => {
    if (!form.description || !form.amount || isNaN(Number(form.amount))) return;
    const tx = { ...form, amount: parseFloat(form.amount) };
    if (editTx) editTransaction(editTx.id, tx);
    else addTransaction(tx);
    onClose();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{editTx ? "Edit Transaction" : "Add Transaction"}</div>
        <div className="modal-grid">
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description} onChange={e => set("description", e.target.value)} placeholder="e.g. Grocery shopping" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input className="form-input" type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editTx ? "Update" : "Add"} Transaction</button>
        </div>
      </div>
    </div>
  );
}
