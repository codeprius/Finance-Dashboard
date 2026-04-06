import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector
} from "recharts";
import { useApp } from "../context/AppContext";
import { CATEGORY_COLORS } from "../data/mockData";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const MONTHS_CONFIG = [
  { key: "2026-01", label: "January 2026", short: "Jan" },
  { key: "2026-02", label: "February 2026", short: "Feb" },
  { key: "2026-03", label: "March 2026", short: "Mar" },
];

function getMonthCategoryData(transactions, monthKey) {
  const txs = transactions.filter(t => t.date.startsWith(monthKey) && t.type === "expense");
  const map = {};
  txs.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name, value,
      pct: total ? ((value / total) * 100).toFixed(1) : "0",
    }));
}

// Ring expand only — labels unaffected
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 15}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (parseFloat(pct) < 6) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 9, fontWeight: 700, pointerEvents: "none" }}>
      {pct}%
    </text>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map(p => (
        <div className="tooltip-row" key={p.dataKey}>
          <span>{p.name}</span>
          <span style={{ color: p.fill, fontWeight: 600 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

function MonthPieChart({ monthKey, label }) {
  const { transactions } = useApp();
  const [activeIdx, setActiveIdx] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const data = getMonthCategoryData(transactions, monthKey);
  const total = data.reduce((s, d) => s + d.value, 0);

  const handleEnter = (_, i) => { setActiveIdx(i); setHoveredData(data[i]); };
  const handleLeave = () => { setActiveIdx(null); setHoveredData(null); };

  if (data.length === 0) return (
    <div className="chart-card" style={{ textAlign: "center" }}>
      <div className="chart-title">{label}</div>
      <div className="empty-state"><div className="empty-text">No expenses</div></div>
    </div>
  );

  return (
    <div className="chart-card fade-in">
      <div className="chart-title">{label}</div>
      <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginBottom: 6 }}>
        Total spent: <span style={{ color: "var(--gold)", fontWeight: 700 }}>{fmt(total)}</span>
      </div>

      {/* Chart first — expanded slice has full room */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            activeIndex={activeIdx}
            activeShape={renderActiveShape}
            data={data}
            cx="50%" cy="50%"
            innerRadius={42} outerRadius={70}
            dataKey="value"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            labelLine={false}
            label={renderLabel}
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#888"} stroke="var(--surface)" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Info box below chart */}
      <div style={{ minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 2 }}>
        {hoveredData ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "0.8rem", color: "var(--gold)" }}>
              {hoveredData.name}
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
              {fmt(hoveredData.value)}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text3)" }}>
              {hoveredData.pct}% of month
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>Hover a slice</div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
        {data.map((d, i) => (
          <div key={i}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "var(--text3)", cursor: "pointer" }}
            onMouseEnter={() => { setActiveIdx(i); setHoveredData(d); }}
            onMouseLeave={handleLeave}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: CATEGORY_COLORS[d.name] || "#888", flexShrink: 0 }} />
            <span>{d.name} ({d.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Insights() {
  const { transactions, totalIncome, totalExpenses } = useApp();

  const monthStats = MONTHS_CONFIG.map(m => {
    const txs = transactions.filter(t => t.date.startsWith(m.key));
    const income = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { month: m.short, income, expenses, savings: income - expenses };
  });

  const catMap = {};
  transactions.filter(t => t.type === "expense").forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : "0";
  const avgMonthlyExp = (totalExpenses / 3).toFixed(0);
  const topMonth = [...monthStats].sort((a, b) => b.expenses - a.expenses)[0];

  return (
    <div>
      <div className="page-header fade-in">
        <h1 className="page-title">Insights</h1>
        <p className="page-sub">Smart observations from your financial data</p>
      </div>

      <div className="insights-grid fade-in">
        <div className="insight-card">
          <div className="insight-title">Top Spending Category</div>
          <div className="insight-value">{topCat ? topCat[0] : "—"}</div>
          <div className="insight-sub">{topCat ? fmt(topCat[1]) + " total spent" : "No data"}</div>
        </div>
        <div className="insight-card">
          <div className="insight-title">Savings Rate</div>
          <div className="insight-value">{savingsRate}%</div>
          <div className="insight-sub">Of total income saved</div>
        </div>
        <div className="insight-card">
          <div className="insight-title">Avg Monthly Spend</div>
          <div className="insight-value">{fmt(avgMonthlyExp)}</div>
          <div className="insight-sub">Across 3 months tracked</div>
        </div>
        <div className="insight-card">
          <div className="insight-title">Highest Spend Month</div>
          <div className="insight-value">{topMonth?.month || "—"}</div>
          <div className="insight-sub">{topMonth ? fmt(topMonth.expenses) + " in expenses" : "No data"}</div>
        </div>
        <div className="insight-card">
          <div className="insight-title">Total Income</div>
          <div className="insight-value" style={{ color: "var(--green-light)" }}>{fmt(totalIncome)}</div>
          <div className="insight-sub">All income sources</div>
        </div>
        <div className="insight-card">
          <div className="insight-title">Expense Ratio</div>
          <div className="insight-value">{totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0}%</div>
          <div className="insight-sub">Expenses vs Income</div>
        </div>
      </div>

      <div className="chart-card fade-in" style={{ marginBottom: 24 }}>
        <div className="chart-title">Monthly Comparison — Income vs Expenses vs Savings</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthStats} barGap={4} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: "var(--text3)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "₹" + (v / 1000) + "k"} />
            <Tooltip content={<BarTooltip />} />
            <Bar dataKey="income" name="Income" fill="#2ECC40" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#C0392B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="savings" name="Savings" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginBottom: 12, fontFamily: "Playfair Display, serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
        Monthly Spending Breakdown by Category
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {MONTHS_CONFIG.map(m => (
          <MonthPieChart key={m.key} monthKey={m.key} label={m.label} />
        ))}
      </div>
    </div>
  );
}
