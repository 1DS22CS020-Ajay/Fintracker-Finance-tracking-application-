import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Statcard from '../components/Statcard'
import TransactionItem from '../components/TransactionItem'
import { apiRequest } from "../api/api.js"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"

const PERIODS = [
  { key: "month", label: "1 Month", summary: "this month" },
  { key: "sixMonths", label: "6 Months", summary: "the last 6 months" },
  { key: "year", label: "1 Year", summary: "this year" },
]

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 17) return "Good afternoon"
  if (hour >= 17 && hour < 21) return "Good evening"
  return "Good night"
}

const formatCurrency = (value) =>
  Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })

const panelStyle = {
  marginTop: 24,
  backgroundColor: "white",
  border: "1px solid #DFE6F7",
  borderRadius: 12,
  overflow: "hidden",
}

const panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 22px",
  borderBottom: "1px solid #DFE6F7",
}

const panelTitleStyle = { margin: 0, fontFamily: "Oswald", fontSize: 20, fontWeight: 500, color: "#16213A" }

const periodButtonStyle = (active) => ({
  padding: "8px 16px",
  border: "none",
  borderRadius: 7,
  backgroundColor: active ? "#093FC8" : "transparent",
  color: active ? "white" : "#093FC8",
  fontFamily: "Oswald",
  fontSize: 15,
  cursor: "pointer",
})

const Dashboard = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem("username") || "User"
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setError("")
        const data = await apiRequest("/transactions/all")
        setTransactions(data.transactions ?? [])
      } catch (err) {
        setError(err.message || "Failed to fetch transactions.")
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === "sixMonths") startDate.setMonth(startDate.getMonth() - 5)
  else if (period === "year") startDate.setMonth(0)

  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return !Number.isNaN(d.getTime()) && d >= startDate && d <= now
  })

  const sumByType = (type) =>
    filteredTransactions.reduce(
      (total, t) => (t.type?.toLowerCase() === type ? total + Number(t.amount) : total),
      0
    )

  const income = sumByType("income")
  const expenses = sumByType("expense")
  const categoryTotals = {}

filteredTransactions.forEach((t) => {
  if (t.type?.toLowerCase() !== "expense") return

  const category = t.category || "Others"
  categoryTotals[category] =
    (categoryTotals[category] || 0) + Number(t.amount)
})

const categoryChartData = Object.entries(categoryTotals)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)

const chartColors = [
  "#093FC8", "#638DF8", "#16AD4A", "#F59E0B",
  "#DC2626", "#9333EA", "#0891B2", "#64748B",
]
  const savings = income - expenses

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)

  const activePeriod = PERIODS.find((p) => p.key === period)

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FF", color: "#16213A", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, maxWidth: 1100, margin: "0 auto", padding: "28px 32px 48px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: "Oswald", fontSize: 32, fontWeight: 600 }}>
                {getGreeting()}, {username}
              </h1>
              <p style={{ margin: "4px 0 0", color: "#5B6785", fontSize: 15 }}>
                Your income, spending and savings for {activePeriod.summary}.
              </p>
            </div>
            <div role="group" aria-label="Select time period" style={{ display: "inline-flex", gap: 4, padding: 4, backgroundColor: "white", border: "1px solid #DFE6F7", borderRadius: 10 }}>
              {PERIODS.map((p) => (
                <button key={p.key} onClick={() => setPeriod(p.key)} aria-pressed={period === p.key} style={periodButtonStyle(period === p.key)}>
                  {p.label}
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
            <p style={{ color: "#5B6785" }}>Loading financial summary...</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <Statcard title="Income" value={formatCurrency(income)} />
              <Statcard title="Expense" value={formatCurrency(expenses)} />
              <Statcard title="Savings" value={formatCurrency(savings)} highlight negative={savings < 0} />
            </div>
          )}

          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <h2 style={panelTitleStyle}>Spending overview</h2>
            </div>
            <div style={{ height: 320, padding: 20 }}>
  {categoryChartData.length === 0 ? (
    <p style={{ color: "#5B6785" }}>
      No expense transactions for this period.
    </p>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryChartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={105}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {categoryChartData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )}
</div>
          </section>

          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <h2 style={panelTitleStyle}>Recent transactions</h2>
              <button
                onClick={() => navigate("/transactions")}
                style={{ border: "none", background: "none", color: "#093FC8", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                View all
              </button>
            </div>
            {recent.length === 0 ? (
              <p style={{ margin: 0, padding: "28px 22px", color: "#5B6785" }}>
                No transactions yet. Add your first one from the Transactions page.
              </p>
            ) : (
              <div style={{ padding: "16px 22px 6px" }}>
                {recent.map((t) => (
                  <TransactionItem key={t.id} item={t.description} amount={t.amount} date={t.date} category={t.category} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default Dashboard