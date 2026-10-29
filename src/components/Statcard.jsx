import React from 'react'

const pillBase = {
  backgroundColor: "white",
  borderRadius: 20,          // fully rounded ends
  padding: "6px 16px",
  width: "fit-content",       // pill shrinks to fit its text
  margin: 0,
}

const Statcard = (props) => {
  return (
    <div
      className="statcard"
      style={{ padding: 20,backgroundColor: "#638DF8",borderRadius: 10,height: 150,width: 200,fontFamily: "Oswald",marginRight: 20,display: "flex",flexDirection: "column",justifyContent: "space-between",alignItems: "flex-start",}}
    >
      <h3 style={{ ...pillBase, color: "rgb(9, 63, 200)", fontSize: 20 }}>
        {props.title}
      </h3>
      <h1 style={{ ...pillBase, color: "black", fontSize: 28 }}>
        Rs {props.value}
      </h1>
    </div>
  )
}

export default Statcard