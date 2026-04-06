import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Sector
} from "recharts";
import { useApp } from "../context/AppContext";
import { CATEGORY_COLORS } from "../data/mockData";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

function getCategoryData(transactions) {
  const map = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      pct: total ? ((value / total) * 100).toFixed(1) : "0",
    }));
}

function getMonthlyTrend(transactions) {
  const months = ["2026-01", "2026-02", "2026-03"];
  const labels = ["Jan", "Feb", "Mar"];
  return months.map((m, i) => {
    const txs = transactions.filter(t => t.date.startsWith(m));
    const income = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { month: labels[i], income, expenses, net: income - expenses };
  });
}

// Active shape only expands the ring — labels are handled separately and never touched
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 14} outerRadius={outerRadius + 18}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

// Percentage labels — always rendered, never re-mounted by hover changes
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (parseFloat(pct) < 5) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 10, fontWeight: 700, pointerEvents: "none" }}>
      {pct}%
    </text>
  );
};

const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map(p => (
        <div className="tooltip-row" key={p.dataKey}>
          <span>{p.name}</span>
          <span style={{ color: p.color, fontWeight: 600 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Overview() {
  const { transactions, totalBalance, totalIncome, totalExpenses, role } = useApp();
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const catData = getCategoryData(transactions);
  const trend = getMonthlyTrend(transactions);

  const handleMouseEnter = (_, i) => {
    setActiveIndex(i);
    setHoveredData(catData[i]);
  };
  const handleMouseLeave = () => {
    setActiveIndex(null);
    setHoveredData(null);
  };

  return (
    <div>
      <div className="page-header fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 className="page-title">Financial Overview</h1>
          {role === "admin" && <span className="admin-badge">🔑 Admin</span>}
        </div>
        <p className="page-sub">Track your income, expenses and spending patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="summary-card balance fade-in fade-in-1">
          <div className="card-label">Net Balance</div>
          <div className="card-amount balance">{fmt(totalBalance)}</div>
          <div className="card-change">Across all months</div>
          <span className="card-icon">⚖</span>
        </div>
        <div className="summary-card income fade-in fade-in-2">
          <div className="card-label">Total Income</div>
          <div className="card-amount income">{fmt(totalIncome)}</div>
          <div className="card-change">{transactions.filter(t => t.type === "income").length} transactions</div>
          <span className="card-icon">↑</span>
        </div>
        <div className="summary-card expense fade-in fade-in-3">
          <div className="card-label">Total Expenses</div>
          <div className="card-amount expense">{fmt(totalExpenses)}</div>
          <div className="card-change">{transactions.filter(t => t.type === "expense").length} transactions</div>
          <span className="card-icon">↓</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card fade-in">
          <div className="chart-title">📈 Monthly Balance Trend</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ECC40" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2ECC40" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C0392B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C0392B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "₹" + (v / 1000) + "k"} />
              <Tooltip content={<AreaTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#2ECC40" strokeWidth={2} fill="url(#incomeGrad)" dot={{ r: 4, fill: "#2ECC40" }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#C0392B" strokeWidth={2} fill="url(#expGrad)" dot={{ r: 4, fill: "#C0392B" }} />
              <Area type="monotone" dataKey="net" name="Net" stroke="#D4AF37" strokeWidth={2.5} fill="url(#netGrad)" dot={{ r: 5, fill: "#D4AF37" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card fade-in" style={{ display: "flex", flexDirection: "column" }}>
          <div className="chart-title">🥧 Spending by Category</div>
          {catData.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No expense data</div></div>
          ) : (
            <>
              {/* Hover info rendered as plain HTML above the chart — zero impact on SVG labels */}
              <div style={{ minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
                {hoveredData ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--gold)" }}>
                      {hoveredData.name}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)" }}>
                      {fmt(hoveredData.value)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>
                      {hoveredData.pct}% of total expenses
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>Hover a slice to see details</div>
                )}
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={78}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    isAnimationActive={false}
                  >
                    {catData.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#888"} stroke="var(--surface)" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 6, padding: "0 4px" }}>
                {catData.slice(0, 6).map((d, i) => (
                  <div key={i}
                    style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.73rem", color: "var(--text3)", cursor: "pointer" }}
                    onMouseEnter={() => { setActiveIndex(i); setHoveredData(d); }}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[d.name] || "#888", flexShrink: 0 }} />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
