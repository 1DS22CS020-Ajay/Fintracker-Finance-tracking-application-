import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import TransactionItem from '../components/TransactionItem'
import { useNavigate } from "react-router-dom";
import { apiRequest } from '../api/api';

const FILTERS = ["All", "Income", "Expense"];

const Transactions = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState("All");
  const [addHover, setAddHover] = useState(false);
  const [searchHover, setSearchHover] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError("");

    const id = searchId.trim();

    if (!id || !/^[1-9]\d*$/.test(id)) {
      setSearchError("Please enter a valid transaction Id.");
      return;
    }

    navigate(`/transactions/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return;
    try {
      await apiRequest(`/transactions/${id}`, {
        method: "DELETE",
      });
      setTransactions((previous) => previous.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete transactions.");
    }
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await apiRequest('/transactions/all');

        setTransactions(data.transactions ?? data);
      } catch (err) {
        setError(err.message || 'Failed to fetch all transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [])

  const visible = [...transactions]
    .filter((t) => filter === "All" || t.type?.toLowerCase() === filter.toLowerCase())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filterButtonStyle = (active) => ({
    padding: "8px 18px",
    border: "none",
    borderRadius: 7,
    backgroundColor: active ? "#093FC8" : "transparent",
    color: active ? "white" : "#093FC8",
    fontFamily: "Oswald",
    fontSize: 15,
    cursor: "pointer",
  });

  const noteStyle = { color: "#5B6785", padding: "8px 0" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FF", color: "#16213A", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <main className="transactions" style={{ flex: 1, minWidth: 0, maxWidth: 1100, margin: "0 auto", padding: "28px 32px 48px", boxSizing: "border-box" }}>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: "Oswald", fontSize: 32, fontWeight: 600 }}>Transactions</h1>
              <p style={{ margin: "4px 0 0", color: "#5B6785", fontSize: 15 }}>Search, filter and manage everything you have recorded.</p>
            </div>
            <button
              className="add-transaction-btn"
              onClick={() => navigate("/transactions/add")}
              onMouseEnter={() => setAddHover(true)}
              onMouseLeave={() => setAddHover(false)}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: 8,
                backgroundColor: addHover ? "#0B78F4" : "#093FC8",
                color: "white",
                fontFamily: "Oswald",
                fontSize: 17,
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              + Add transaction
            </button>
          </div>

          <section style={{ backgroundColor: "white", border: "1px solid #DFE6F7", borderRadius: 12, padding: 20 }}>
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Search by transaction Id"
                value={searchId}
                onChange={(e) => { setSearchId(e.target.value); setSearchError(""); }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  fontSize: 16,
                  color: "#16213A",
                  backgroundColor: "white",
                  borderRadius: 8,
                  outline: "none",
                  border: searchFocused ? "1.5px solid #2750F5" : "1.5px solid #DFE6F7",
                  boxShadow: searchFocused ? "0 0 0 3px rgba(99,141,248,0.3)" : "none",
                }}
              />
              <button
                type="submit"
                onMouseEnter={() => setSearchHover(true)}
                onMouseLeave={() => setSearchHover(false)}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: 8,
                  backgroundColor: searchHover ? "#0B78F4" : "#093FC8",
                  color: "white",
                  fontFamily: "Oswald",
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
              >
                Search
              </button>
            </form>
            {searchError && <div role="alert" style={{ marginTop: 10, color: "#B91C1C", fontSize: 14 }}>{searchError}</div>}
          </section>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0 16px", flexWrap: "wrap" }}>
            <span style={{ color: "#5B6785", fontFamily: "Oswald", fontSize: 15 }}>Filter by</span>
            <div className="filter-btns-section" role="group" aria-label="Filter transactions" style={{ display: "inline-flex", gap: 4, padding: 4, backgroundColor: "white", border: "1px solid #DFE6F7", borderRadius: 10 }}>
              {FILTERS.map((f) => (
                <button key={f} className={`${f}-btn`} aria-pressed={filter === f} onClick={() => setFilter(f)} style={filterButtonStyle(filter === f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading && <p style={noteStyle}>Loading transactions...</p>}

          {!loading && error && (
            <div role="alert" style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
              {error}
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <p style={noteStyle}>No transactions found. Add your first transaction!</p>
          )}

          {!loading && !error && transactions.length > 0 && visible.length === 0 && (
            <p style={noteStyle}>No {filter.toLowerCase()} transactions found.</p>
          )}

          {!loading && !error && visible.map((t) => (
            <TransactionItem
              key={t.id}
              date={t.date}
              item={t.description}
              category={t.category}
              amount={t.amount}
              onDelete={() => handleDelete(t.id)}
            />
          ))}
        </main>
      </div>
    </div>
  )
}

export default Transactions