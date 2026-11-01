import React, { useState, useEffect } from 'react';
import { apiRequest } from "../api/api.js";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

const COLORS = [
  "#093FC8",
  "#638DF8",
  "#16AD4A",
  "#F59E0B",
  "#DC2626",
  "#9333EA",
  "#0891B2",
  "#64748B",
];

const PERIODS = [
  { label: "1 Month", value: "month", summary: "this month" },
  { label: "6 Months", value: "sixMonths", summary: "the last 6 months" },
  { label: "1 Year", value: "year", summary: "this year" },
];

const SummaryCard = ({ title, value, highlight = false, negative = false }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 14,
      padding: "20px 22px",
      boxSizing: "border-box",
      backgroundColor: highlight ? "#638DF8" : "white",
      border: `1px solid ${highlight ? "#638DF8" : "#DFE6F7"}`,
      borderRadius: 12,
      fontFamily: "Oswald",
    }}
  >
    <span style={{ alignSelf: "flex-start", padding: "4px 14px", borderRadius: 999, backgroundColor: highlight ? "white" : "#EEF3FF", color: "#093FC8", fontSize: 15 }}>
      {title}
    </span>
    <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.1, color: negative ? "#DC2626" : "#16213A" }}>
      {value}
    </span>
  </div>
);

const panelStyle = {
  backgroundColor: "white",
  border: "1px solid #DFE6F7",
  borderRadius: 12,
  marginBottom: 24,
  overflow: "hidden",
  minWidth: 0,
};

const panelHeaderStyle = { padding: "16px 22px", borderBottom: "1px solid #DFE6F7" };

const panelTitleStyle = { margin: 0, fontFamily: "Oswald", fontSize: 20, fontWeight: 500, color: "#16213A" };

const emptyStyle = { margin: 0, padding: "28px 22px", color: "#5B6785" };

const axisTick = { fontSize: 13, fill: "#5B6785" };

const tooltipStyle = { borderRadius: 8, border: "1px solid #DFE6F7", boxShadow: "none" };

const formatCurrency = (value) =>
  `Rs ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const periodButtonStyle = (active) => ({
  padding: "8px 16px",
  border: "none",
  borderRadius: 7,
  backgroundColor: active ? "#093FC8" : "transparent",
  color: active ? "white" : "#093FC8",
  fontFamily: "Oswald",
  fontSize: 15,
  cursor: "pointer",
});

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setError("");
        const data = await apiRequest("/transactions/all");
        setTransactions(data.transactions ?? []);
      } catch (err) {
        setError(err.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const now = new Date();

  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  if (period === "sixMonths") {
    startDate.setMonth(startDate.getMonth() - 5);
  } else if (period === "year") {
    startDate.setMonth(0);
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return !Number.isNaN(date.getTime()) && date >= startDate && date <= now;
  });

  const income = filteredTransactions.reduce((total, transaction) => {
    return transaction.type?.toLowerCase() === "income" ? total + Number(transaction.amount) : total;
  }, 0);

  const expenses = filteredTransactions.reduce((total, transaction) => {
    return transaction.type?.toLowerCase() === "expense" ? total + Number(transaction.amount) : total;
  }, 0);

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const monthlyData = {};

  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        income: 0,
        expenses: 0,
      };
    }

    if (transaction.type?.toLowerCase() === "income") {
      monthlyData[key].income += Number(transaction.amount);
    } else if (transaction.type?.toLowerCase() === "expense") {
      monthlyData[key].expenses += Number(transaction.amount);
    }
  });

  const monthlyChartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  const categoryTotals = {};

  filteredTransactions.forEach((transaction) => {
    if (transaction.type?.toLowerCase() !== "expense") {
      return;
    }
    const category = transaction.category || "Others";
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount);
  });

  const categoryChartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const activePeriod = PERIODS.find((p) => p.value === period);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FF", color: "#16213A", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, maxWidth: 1100, margin: "0 auto", padding: "28px 32px 48px", boxSizing: "border-box" }}>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: "Oswald", fontSize: 32, fontWeight: 600 }}>Financial Analytics</h1>
              <p style={{ margin: "4px 0 0", color: "#5B6785", fontSize: 15 }}>
                See where your money came from and where it went {activePeriod.summary}.
              </p>
            </div>
            <div role="group" aria-label="Select time period" style={{ display: "inline-flex", gap: 4, padding: 4, backgroundColor: "white", border: "1px solid #DFE6F7", borderRadius: 10 }}>
              {PERIODS.map((option) => (
                <button key={option.value} onClick={() => setPeriod(option.value)} aria-pressed={period === option.value} style={periodButtonStyle(period === option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div role="alert" style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
              {error}
            </div>
          )}

          {loading ? (
            <p style={{ color: "#5B6785" }}>Loading Analytics...</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20, marginBottom: 24 }}>
                <SummaryCard title="Total Income" value={formatCurrency(income)} />
                <SummaryCard title="Total Expenses" value={formatCurrency(expenses)} />
                <SummaryCard title="Total Savings" value={formatCurrency(savings)} highlight negative={savings < 0} />
                <SummaryCard title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} negative={savingsRate < 0} />
              </div>

              <section style={panelStyle}>
                <div style={panelHeaderStyle}>
                  <h2 style={panelTitleStyle}>Monthly Income vs Expenses</h2>
                </div>
                {monthlyChartData.length === 0 ? (
                  <p style={emptyStyle}>No transactions data for this period.</p>
                ) : (
                  <div style={{ width: "100%", height: 340, padding: "20px 16px 12px 0", boxSizing: "border-box" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#DFE6F7" vertical={false} />
                        <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: "#DFE6F7" }} tickLine={false} />
                        <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString("en-IN")} />
                        <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} cursor={{ fill: "#EEF3FF" }} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#093FC8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section style={panelStyle}>
                <div style={panelHeaderStyle}>
                  <h2 style={panelTitleStyle}>Spending By Category</h2>
                </div>
                {categoryChartData.length === 0 ? (
                  <p style={emptyStyle}>No expenses transactions for this period.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", alignItems: "center", gap: 24, padding: 22 }}>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={115} paddingAngle={2} stroke="white">
                            {categoryChartData.map((entry, index) => (
                              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      {categoryChartData.map((category, index) => (
                        <div
                          key={category.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            padding: "12px 0",
                            borderBottom: index === categoryChartData.length - 1 ? "none" : "1px solid #DFE6F7",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, backgroundColor: COLORS[index % COLORS.length] }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{category.name}</span>
                          </span>
                          <span style={{ fontFamily: "Oswald", fontSize: 17, whiteSpace: "nowrap" }}>
                            {formatCurrency(category.value)}
                            <span style={{ marginLeft: 8, fontSize: 13, color: "#5B6785" }}>
                              {expenses > 0 ? ((category.value / expenses) * 100).toFixed(0) : 0}%
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Analytics