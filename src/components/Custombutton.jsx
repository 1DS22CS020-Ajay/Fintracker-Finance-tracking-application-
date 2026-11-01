import React, { useState } from 'react'

// variant "primary" (default): solid blue button
// variant "nav": sidebar link, pass active={true} for the current page
const Custombutton = (props) => {
  const [hover, setHover] = useState(false);
  const isNav = props.variant === "nav";

  const base = {
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "Oswald",
    fontSize: 16,
    transition: "background-color 0.15s ease, color 0.15s ease",
  };

  const navStyle = {
    ...base,
    width: "100%",
    padding: "12px 16px",
    textAlign: "left",
    backgroundColor: props.active ? "white" : hover ? "rgba(255,255,255,0.12)" : "transparent",
    color: props.active ? "#093FC8" : hover ? "white" : "rgba(255,255,255,0.82)",
  };

  const primaryStyle = {
    ...base,
    padding: "10px 20px",
    color: "white",
    backgroundColor: hover ? "#0B78F4" : props.bg || "#093FC8",
  };

  return (
    <button
      className="custom-button"
      type={props.type || "button"}
      disabled={props.disabled}
      aria-current={props.active ? "page" : undefined}
      style={isNav ? navStyle : primaryStyle}
      onClick={props.function}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {props.children}
    </button>
  )
}

export default Custombutton