import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { apiRequest } from '../api/api';

const Field = ({ label, htmlFor, wide = false, children }) => (
  <div style={{ gridColumn: wide ? "1 / -1" : "auto", minWidth: 0 }}>
    <label htmlFor={htmlFor} style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#16213A" }}>
      {label}
    </label>
    {children}
  </div>
)

const todayLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

const TransactionForm = () => {
  const [type, setType] = useState("Income");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayLocal());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [budgetId, setBudgetId] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [focused, setFocused] = useState("");
  const [cancelHover, setCancelHover] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await apiRequest("/budgets/all");
        setBudgets(data.budgets ?? []);
      } catch (err) {
        setBudgetError(err.message || "Failed to load budgets.");
      }
    };
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!description.trim() || !category || !date || !amount || Number(amount) <= 0) {
      setError("Please fill in the amount, category, description and date.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/transactions/create", {
        method: "POST",
        body: JSON.stringify({
          description: description.trim(),
          amount: Number(amount),
          category,
          type,
          date,
          budgetId: budgetId ? Number(budgetId) : null,
        }),
      });

      navigate("/transactions");
    } catch (err) {
      setError(err.message || "Failed to add transaction");
    } finally {
      setLoading(false);
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

  const typeButtonStyle = (active) => ({
    flex: 1,
    padding: "10px 0",
    border: "none",
    borderRadius: 7,
    backgroundColor: active ? "#093FC8" : "transparent",
    color: active ? "white" : "#093FC8",
    fontFamily: "Oswald",
    fontSize: 16,
    cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FF", color: "#16213A", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, maxWidth: 800, margin: "0 auto", padding: "28px 32px 48px", boxSizing: "border-box" }}>
          <h1 style={{ margin: 0, fontFamily: "Oswald", fontSize: 32, fontWeight: 600 }}>Add transaction</h1>
          <p style={{ margin: "4px 0 24px", color: "#5B6785", fontSize: 15 }}>Record money coming in or going out.</p>

          <form onSubmit={handleSubmit} style={{ backgroundColor: "white", border: "1px solid #DFE6F7", borderRadius: 12, padding: 28 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 6, fontSize: 14, fontWeight: 600 }}>Type</div>
              <div role="group" aria-label="Transaction type" style={{ display: "flex", gap: 4, padding: 4, backgroundColor: "#EEF3FF", border: "1px solid #DFE6F7", borderRadius: 10, maxWidth: 320 }}>
                <button type="button" aria-pressed={type === "Income"} onClick={() => setType("Income")} style={typeButtonStyle(type === "Income")}>Income</button>
                <button type="button" aria-pressed={type === "Expense"} onClick={() => setType("Expense")} style={typeButtonStyle(type === "Expense")}>Expense</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              <Field label="Amount (Rs)" htmlFor="amount">
                <input id="amount" type="number" min="0" step="any" placeholder="Add amount" value={amount}
                  onChange={(e) => setAmount(e.target.value)} {...focusProps("amount")} style={inputStyle("amount")} />
              </Field>

              <Field label="Date" htmlFor="date">
                <input id="date" type="date" className="DOT" value={date}
                  onChange={(e) => setDate(e.target.value)} {...focusProps("date")} style={inputStyle("date")} />
              </Field>

              <Field label="Category" htmlFor="category">
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} {...focusProps("category")} style={inputStyle("category")}>
                  <option value="">Select category</option>
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transport">Transport</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Salary">Salary</option>
                  <option value="Stay">Stay</option>
                </select>
              </Field>

              <Field label="Assign to budget (optional)" htmlFor="budget">
                <select id="budget" value={budgetId} onChange={(e) => setBudgetId(e.target.value)} {...focusProps("budget")} style={inputStyle("budget")}>
                  <option value="">No budget</option>
                  {budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.name} — Rs {Number(budget.amount).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
                {budgetError && <div style={{ marginTop: 6, color: "#B91C1C", fontSize: 13 }}>{budgetError}</div>}
              </Field>

              <Field label="Description" htmlFor="description" wide>
                <input id="description" type="text" className="desc" placeholder="e.g. Breakfast" value={description}
                  onChange={(e) => setDescription(e.target.value)} {...focusProps("description")} style={inputStyle("description")} />
              </Field>
            </div>

            {error && (
              <div role="alert" style={{ marginTop: 20, padding: "10px 14px", borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setSubmitHover(true)}
                onMouseLeave={() => setSubmitHover(false)}
                style={{
                  padding: "12px 28px",
                  border: "none",
                  borderRadius: 8,
                  backgroundColor: loading ? "#638DF8" : submitHover ? "#0B78F4" : "#093FC8",
                  color: "white",
                  fontFamily: "Oswald",
                  fontSize: 17,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Adding..." : "Add transaction"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/transactions")}
                onMouseEnter={() => setCancelHover(true)}
                onMouseLeave={() => setCancelHover(false)}
                style={{
                  padding: "12px 24px",
                  border: "1px solid #093FC8",
                  borderRadius: 8,
                  backgroundColor: cancelHover ? "#EEF3FF" : "white",
                  color: "#093FC8",
                  fontFamily: "Oswald",
                  fontSize: 17,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

export default TransactionForm