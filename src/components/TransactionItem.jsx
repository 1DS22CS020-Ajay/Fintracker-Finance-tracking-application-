import React, { useState } from 'react'

// Delete button only shows when onDelete is passed.
const TransactionItem = (props) => {
  const [hover, setHover] = useState(false);

  const parsed = new Date(props.date);
  const dateText = !props.date
    ? ""
    : Number.isNaN(parsed.getTime())
      ? String(props.date)
      : parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div
      className="transactionItem"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 10,
        padding: "14px 18px",
        boxSizing: "border-box",
        backgroundColor: "white",
        border: "1px solid #DFE6F7",
        borderRadius: 10,
        fontFamily: "Oswald",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, color: "#16213A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {props.item}
        </div>
        {(dateText || props.category) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 13, color: "#5B6785" }}>
            {dateText && <span>{dateText}</span>}
            {props.category && (
              <span style={{ padding: "2px 10px", borderRadius: 999, backgroundColor: "#EEF3FF", color: "#093FC8" }}>
                {props.category}
              </span>
            )}
          </div>
        )}
      </div>

      <span style={{ fontSize: 20, color: "#16213A" }}>
        Rs {Number(props.amount).toLocaleString("en-IN")}
      </span>

      {props.onDelete && (
        <button
          onClick={props.onDelete}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={`Delete ${props.item}`}
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
          Delete
        </button>
      )}
    </div>
  )
}

export default TransactionItem;