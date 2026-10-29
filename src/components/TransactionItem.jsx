import React from 'react'

const TransactionItem = (props) => {
  return (
    <>
      <div className = "transactionItem" style = {{display : "flex", justifyContent : "space-between",padding : 10, backgroundColor : "#638DF8",borderRadius : 5,marginTop : 10,width : 500,color : "white",fontFamily : "Oswald"}}>
            <h4>{props.date}</h4>
            <h4>{props.item}</h4>
            <h4>{props.category}</h4>
            <h4>Rs {props.amount}</h4>
            <button onClick = {props.onDelete} style = {{backgroundColor : "#dc2626",color : "white",border : "none",borderRadius : 5,padding : "6px 12px",cursor : "pointer",fontFamily : "Oswald"}}>Delete</button> 
      </div>
    </>
  )
}

export default TransactionItem;