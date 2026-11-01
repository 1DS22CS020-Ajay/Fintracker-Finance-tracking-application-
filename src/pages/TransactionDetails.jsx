import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';

const DetailRow = ({ label, value, wide = false }) => (
  <div style={{ gridColumn: wide ? "1 / -1" : "auto", minWidth: 0 }}>
    <div style={{ fontFamily: "Oswald", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#5B6785" }}>
      {label}
    </div>
    <div style={{ marginTop: 6, fontSize: 17, color: "#16213A", wordBreak: "break-word" }}>
      {value || "-"}
    </div>
  </div>
)

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backHover, setBackHover] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await apiRequest(`/transactions/${id}`);
        setTransaction(data.transaction ?? data);
      } catch (err) {
        setError(err.message || 'Failed to fetch transaction.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const isIncome = transaction?.type?.toLowerCase() === "income";
  const parsedDate = transaction ? new Date(transaction.date) : null;
  const dateText =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : transaction?.date;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FF", color: "#16213A", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, maxWidth: 800, margin: "0 auto", padding: "28px 32px 48px", boxSizing: "border-box" }}>

          <button
            onClick={() => navigate('/transactions')}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
            style={{
              padding: "8px 16px",
              marginBottom: 20,
              border: "1px solid #093FC8",
              borderRadius: 8,
              backgroundColor: backHover ? "#093FC8" : "white",
              color: backHover ? "white" : "#093FC8",
              fontFamily: "Oswald",
              fontSize: 15,
              cursor: "pointer",
              transition: "background-color 0.15s ease, color 0.15s ease",
            }}
          >
            ← Back to transactions
          </button>

          <h1 style={{ margin: "0 0 20px", fontFamily: "Oswald", fontSize: 32, fontWeight: 600 }}>
            Transaction Details
          </h1>

          {loading && <p style={{ color: "#5B6785" }}>Loading...</p>}

          {!loading && error && (
            <div role="alert" style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
              {error}
            </div>
          )}

          {!loading && !error && !transaction && (
            <p style={{ color: "#5B6785" }}>Transaction not found.</p>
          )}

          {!loading && !error && transaction && (
            <section style={{ backgroundColor: "white", border: "1px solid #DFE6F7", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "24px 28px", backgroundColor: "#EEF3FF", borderBottom: "1px solid #DFE6F7" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: 999,
                    backgroundColor: isIncome ? "white" : "#FEF2F2",
                    color: isIncome ? "#093FC8" : "#B91C1C",
                    border: `1px solid ${isIncome ? "#DFE6F7" : "#FECACA"}`,
                    fontFamily: "Oswald",
                    fontSize: 15,
                    textTransform: "capitalize",
                  }}
                >
                  {transaction.type}
                </span>
                <div style={{ marginTop: 12, fontFamily: "Oswald", fontSize: 44, fontWeight: 600, lineHeight: 1.1 }}>
                  Rs {Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 24,
                  padding: 28,
                }}
              >
                <DetailRow label="Category" value={transaction.category} />
                <DetailRow label="Date" value={dateText} />
                <DetailRow label="Transaction ID" value={transaction.id} />
                <DetailRow label="Description" value={transaction.description} wide />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default TransactionDetails;