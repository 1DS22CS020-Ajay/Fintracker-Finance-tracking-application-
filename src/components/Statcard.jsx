import React from 'react'

// highlight: solid blue card (use for the main number, e.g. Savings)
// negative: shows the value in red
const Statcard = ({ title, value, highlight = false, negative = false }) => {
  return (
    <div
      className="statcard"
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
      <span
        style={{
          alignSelf: "flex-start",
          padding: "4px 14px",
          borderRadius: 999,
          backgroundColor: highlight ? "white" : "#EEF3FF",
          color: "#093FC8",
          fontSize: 15,
        }}
      >
        {title}
      </span>
      <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.1, color: negative ? "#DC2626" : "#16213A" }}>
        Rs {value}
      </span>
    </div>
  )
}

export default Statcard