import React from 'react'

const Navbar = () => {
  const username = localStorage.getItem("username") || "User";
  return (
    <header
      className="navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        padding: "0 24px",
        boxSizing: "border-box",
        backgroundColor: "#0B78F4",
        color: "white",
        fontFamily: "Oswald",
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: 0.5 }}>FINTRACKER</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16 }}>
        <span
          aria-hidden="true"
          style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: "50%", backgroundColor: "white", color: "#093FC8", fontWeight: 600 }}
        >
          {username.charAt(0).toUpperCase()}
        </span>
        <span>{username}</span>
      </div>
    </header>
  )
}

export default Navbar