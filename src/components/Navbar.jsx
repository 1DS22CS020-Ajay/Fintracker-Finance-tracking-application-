import React from 'react'

const Navbar = () => {
  const username = localStorage.getItem("username") || "User";
  return (
   <>
      <div className = "navbar" style = {{display: "flex", justifyContent: "space-between", padding : 10, backgroundColor : "#0B78F4", borderRadius : 10,width : 1470, color : "white", fontFamily : "Oswald",marginBottom : 10}}>
        <h3>FINTRACKER</h3>
        <h4>👤{username}</h4>
     </div>
   </>
  )
}

export default Navbar