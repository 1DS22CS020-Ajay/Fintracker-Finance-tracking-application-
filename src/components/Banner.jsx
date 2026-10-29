import React from 'react'

const Banner = () => {
  return (
    <>
     <div className = "banner-page" style = {{display : "flex",flexDirection : "column",alignItems : "center",fontFamily : "Bebas Neue",backgroundColor : "#2750F5",height : "100vh"}}>
         <div style = {{backgroundColor : "white",borderRadius : 5,border : "5px solid transparent" ,fontSize : 70,marginTop : 50,color : "#072A9C"}}>FinTracker</div>
         <br/>
         <br/>
         <div style = {{display : "flex"}}>
            <h2>Keep track of your:</h2>
            <div style = {{fontFamily : "Bebas Neue"}}>
               <h2 style = {{backgroundColor : "white",borderRadius : 5,border : "5px solid transparent",backgroundColor : "#6381F8"}}>1.Cash Inflow</h2>
               <h2 style = {{backgroundColor : "white",borderRadius : 5,border : "5px solid transparent",backgroundColor : "#6381F8"}}>2.Cash Outflow</h2>
            </div>
         </div>
         <h2>Web-based Wallet offering wonderful insights.</h2>
     </div>
    </>
  )
}

export default Banner