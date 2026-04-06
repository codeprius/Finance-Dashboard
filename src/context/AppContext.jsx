import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_TRANSACTIONS } from "../data/mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("fin_transactions");
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch { return INITIAL_TRANSACTIONS; }
  });
  const [role, setRole] = useState(() => localStorage.getItem("fin_role") || "viewer");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("fin_dark") === "true");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    localStorage.setItem("fin_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => { localStorage.setItem("fin_role", role); }, [role]);
  useEffect(() => {
    localStorage.setItem("fin_dark", darkMode);
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const addTransaction = (tx) => {
    if (role !== "admin") return;
    setTransactions(prev => [...prev, { ...tx, id: Date.now() }]);
  };

  const deleteTransaction = (id) => {
    if (role !== "admin") return;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const editTransaction = (id, updates) => {
    if (role !== "admin") return;
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const filteredTransactions = transactions.filter(t => {
    const matchMonth = filterMonth === "all" || t.date.startsWith(filterMonth);
    const matchType = filterType === "all" || t.type === filterType;
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    const matchSearch = !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchType && matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sortBy === "amount-desc") return b.amount - a.amount;
    if (sortBy === "amount-asc") return a.amount - b.amount;
    return 0;
  });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  return (
    <AppContext.Provider value={{
      transactions, filteredTransactions, addTransaction, deleteTransaction, editTransaction,
      role, setRole, darkMode, setDarkMode,
      filterMonth, setFilterMonth, filterType, setFilterType,
      filterCategory, setFilterCategory, searchQuery, setSearchQuery,
      sortBy, setSortBy,
      totalIncome, totalExpenses, totalBalance,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
