import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/api.js';

const formatCurrency = (value) =>
  `Rs ${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value).slice(0, 10)
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

const Field = ({ label, htmlFor, children }) => (
  <div style={{ minWidth: 0 }}>
    <label htmlFor={htmlFor} style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#16213A" }}>
      {label}
    </label>
    {children}
  </div>
);

const BudgetCard = ({ budget, onDelete }) => {
  const [hover, setHover] = useState(false);

  const total = Number(budget.amount ?? 0);
  const spent = Number(budget.totalSpent ?? 0);
  const remaining = Number(budget.remaining ?? total - spent);
  const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const over = spent > total;
  const barColor = over ? "#DC2626" : percentage >= 80 ? "#F59E0B" : "#093FC8";

  const figure = (label, value, color = "#16213A") => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#5B6785" }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 17, color, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "white", border: "1px solid #DFE6F7", borderRadius: 12, padding: 20, boxSizing: "border-box", fontFamily: "Oswald" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "#16213A", minWidth: 0, wordBreak: "break-word" }}>
          {budget.name}
        </h3>
        <span style={{ flexShrink: 0, padding: "2px 12px", borderRadius: 999, backgroundColor: "#EEF3FF", color: "#093FC8", fontSize: 13 }}>
          {budget.category || "All categories"}
        </span>
      </div>

      <p style={{ margin: "6px 0 16px", color: "#5B6785", fontSize: 13 }}>
        {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {figure("Budget", formatCurrency(total))}
        {figure("Spent", formatCurrency(spent))}
        {figure("Left", formatCurrency(remaining), remaining < 0 ? "#DC2626" : "#16213A")}
      </div>

      <div style={{ height: 10, backgroundColor: "#EEF3FF", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percentage}%`, backgroundColor: barColor, borderRadius: 10, transition: "width 0.3s ease" }} />
      </div>
      <p style={{ margin: "8px 0 16px", fontSize: 13, color: over ? "#DC2626" : "#5B6785" }}>
        {over ? "Over budget — " : ""}{percentage.toFixed(1)}% of budget used
      </p>

      <button
        type="button"
        onClick={onDelete}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid #FCA5A5",
          backgroundColor: hover ? "#DC2626" : "white",
          color: hover ? "white" : "#DC2626",
          fontFamily: "Oswald",
          fontSize: 14,
          cursor: "pointer",
          transition: "background-color 0.15s ease, color 0.15s ease",
        }}
      >
        Delete budget
      </button>
    </div>
  );
};

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState("");
  const [submitHover, setSubmitHover] = useState(false);

  const fetchBudgets = async () => {
    try {
      setError("");
      const data = await apiRequest("/budgets/all");
      setBudgets(data.budgets ?? []);
    } catch (err) {
      setError(err.message || "Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim() || !amount || !startDate || !endDate) {
      setError("Please fill all the details.");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Budget amount must be greater than zero.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("startdate must be less than or equal to end date.");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/budgets/create", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          amount: Number(amount),
          category: category || null,
          startDate,
          endDate,
        }),
      });

      setName("");
      setAmount("");
      setCategory("");
      setStartDate("");
      setEndDate("");
      setMessage("Budget created successfully.");

      await fetchBudgets();
    } catch (err) {
      setError(err.message || "Failed to create budget.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this budget?");
    if (!confirmed) return;
    try {
      setError("");
      setMessage("");

      await apiRequest(`/budgets/${id}`, {
        method: "DELETE",
      });

      setBudgets((current) => current.filter((budget) => budget.id !== id));
      setMessage("Budget deleted successfully.");
    } catch (err) {
      setError(err.message || "failed to delete budget");
    }
  };

  const inputStyle = (id) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    fontSize: 16,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    color: "#16213A",
    backgroundColor: "white",
    borderRadius: 8,
    outline: "none",
    border: focused === id ? "1.5px solid #2750F5" : "1.5px solid #DFE6F7",
    boxShadow: focused === id ? "0 0 0 3px rgba(99,141,248,0.3)" : "none",
  });

  const focusProps = (id) => ({ onFocus: () => setFocused(id), onBlur: () => setFocused("") });

  const panelStyle = { backgroundColor: "white", border: "1px solid #DFE6F7", borderRadius: 12 };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FF", color: "#16213A", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, maxWidth: 1100, margin: "0 auto", padding: "28px 32px 48px", boxSizing: "border-box" }}>
          <h1 style={{ margin: 0, fontFamily: "Oswald", fontSize: 32, fontWeight: 600 }}>Budgets</h1>
          <p style={{ margin: "4px 0 24px", color: "#5B6785", fontSize: 15 }}>Set spending limits and see how much of each one you have used.</p>

          {error && (
            <div role="alert" style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
              {error}
            </div>
          )}
          {message && (
            <div role="status" style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 8, backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D" }}>
              {message}
            </div>
          )}

          <section style={{ ...panelStyle, padding: 28 }}>
            <h2 style={{ margin: "0 0 20px", fontFamily: "Oswald", fontSize: 20, fontWeight: 500 }}>Create a budget</h2>
            <form onSubmit={handleCreateBudget}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                <Field label="Budget name *" htmlFor="budget-name">
                  <input id="budget-name" type="text" placeholder="e.g Goa trip" value={name}
                    onChange={(e) => setName(e.target.value)} required {...focusProps("budget-name")} style={inputStyle("budget-name")} />
                </Field>
                <Field label="Budget amount (Rs) *" htmlFor="budget-amount">
                  <input id="budget-amount" type="number" min="0.01" step="0.01" placeholder="e.g. 12000" value={amount}
                    onChange={(e) => setAmount(e.target.value)} required {...focusProps("budget-amount")} style={inputStyle("budget-amount")} />
                </Field>
                <Field label="Category (optional)" htmlFor="budget-category">
                  <select id="budget-category" value={category} onChange={(e) => setCategory(e.target.value)}
                    {...focusProps("budget-category")} style={inputStyle("budget-category")}>
                    <option value="">All categories</option>
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health">Health</option>
                    <option value="Travel">Travel</option>
                  </select>
                </Field>
                <Field label="Start date *" htmlFor="budget-start">
                  <input id="budget-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    required {...focusProps("budget-start")} style={inputStyle("budget-start")} />
                </Field>
                <Field label="End date *" htmlFor="budget-end">
                  <input id="budget-end" type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)}
                    required {...focusProps("budget-end")} style={inputStyle("budget-end")} />
                </Field>
              </div>

              <button
                type="submit"
                disabled={saving}
                onMouseEnter={() => setSubmitHover(true)}
                onMouseLeave={() => setSubmitHover(false)}
                style={{
                  marginTop: 24,
                  padding: "12px 28px",
                  border: "none",
                  borderRadius: 8,
                  backgroundColor: saving ? "#638DF8" : submitHover ? "#0B78F4" : "#093FC8",
                  color: "white",
                  fontFamily: "Oswald",
                  fontSize: 17,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Creating..." : "Create budget"}
              </button>
            </form>
          </section>

          <h2 style={{ margin: "32px 0 16px", fontFamily: "Oswald", fontSize: 22, fontWeight: 500 }}>Your budgets</h2>

          {loading ? (
            <p style={{ color: "#5B6785" }}>Loading budgets...</p>
          ) : budgets.length === 0 ? (
            <div style={{ ...panelStyle, padding: "28px 22px", color: "#5B6785" }}>
              You haven't created any budgets yet. Use the form above to add your first one.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
              {budgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} onDelete={() => handleDeleteBudget(budget.id)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Budgets