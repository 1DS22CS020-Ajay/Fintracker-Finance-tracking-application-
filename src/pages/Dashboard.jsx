import React from 'react'
import { useState,useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Statcard from '../components/Statcard'
import TransactionItem from '../components/TransactionItem'
import { apiRequest } from "../api/api.js"

const Dashboard = () => {
  const username = localStorage.getItem("username") || "User";
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");

useEffect(()=>{
  const fetchTransactions = async () => {
    try{
      setError("");
      const data = await apiRequest("/transactions/all");
      setTransactions(data.transactions ?? []);
    }catch(err){
      setError(err.message ||  "Failed to fetch transactions.");
    }finally{
      setLoading(false);
    }
  };

  fetchTransactions();
},[]);



const getGreeting = () => {
  const hour = new Date().getHours();

  if(hour >= 6 && hour < 12){
    return "Good morning"
  }else if(hour >= 12 && hour < 17){
    return "Good afternoon"
  }else if(hour >= 17 && hour < 21){
    return "Good evening"
  }else{
    return "Good night"
  }

}

const now = new Date();

const startDate = new Date(
  now.getFullYear(),
  now.getMonth(),
  1
);

if ( period === "sixMonths"){
  startDate.setMonth(startDate.getMonth() - 5);
}else if( period === "year"){
  startDate.setMonth(0);
}

const filteredTransactions = transactions.filter((transaction) => {
  const transactionDate = new Date(transaction.date);

  return (
    !Number.isNaN(transactionDate.getTime()) && transactionDate >= startDate && transactionDate <= now 
  );
})

const income = filteredTransactions.reduce((total, transaction) => {
  return transaction.type?.toLowerCase() === "income" ? total + Number(transaction.amount) : total;
}, 0);

const expenses = filteredTransactions.reduce((total, transaction) => {
  return transaction.type?.toLowerCase() === "expense" ?  total + Number(transaction.amount) : total;
}, 0);

const savings = income - expenses;

const formatCurrency = (value) => 
  Number(value).toLocaleString("en-IN", {
    maximumFractionDigits : 2,
  });

    
  return (
    <div>
      <Navbar/>
      <div style = {{display : "flex"}}>
        <Sidebar/>
        <div style = {{marginLeft : 20}}>
          <h1 style = {{color : "black",fontFamily : "Oswald"}}>{getGreeting()},{username}</h1>
          <div style = {{display :"flex",justifyContent : "flex-end",gap : 10,marginTop : 20,marginBottom : 20,flexWrap : "wrap"}}>
            <button onClick = {() => setPeriod("month")} style = {periodButtonStyle(period === "month")}>1 Month</button>
            <button onClick = {() => setPeriod("sixMonths")} style = {periodButtonStyle(period === "sixMonths")}>6 Months</button>
            <button onClick = {() => setPeriod("year")} style = {periodButtonStyle(period === "year")}>1 Year</button>
          </div>
          {error && <p style = {{ color : "red"}}>{error}</p>}
          {loading ? (<p>Loading financial summary...</p>) : (
            <div style = {{display : "flex",justifyContent : "space-between",gap : 20,marginTop : 20,flexWrap : "wrap"}}>
              <Statcard title = "Income" value = {formatCurrency(income)}/>
              <Statcard title = "Expense" value = {formatCurrency(expenses)}/>
              <Statcard title = "Savings" value = {formatCurrency(savings)}/>
            </div>  
          )}
        <div style = {{width : 850, height : 500,border : "1px dotted black",marginTop : 20}}>
           <h4>[chart]</h4>
        </div>
        <br/>
        <h2 style = {{color : "black",fontFamily : "Oswald"}}>Recent Transactions</h2>
        <div style = {{border : "1px solid black",width : 1000}}></div>
        <div>
          {[...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,3).map((t)=>(
            <TransactionItem key = {t.id} item = {t.description} amount = {t.amount}/>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}

const periodButtonStyle = (active) => ({
  backgroundColor: active ? "#093FC8" : "white",
  color: active ? "white" : "#093FC8",
  border : "1px solid #093FC8",
  borderRadius : 6,
  padding : "10px 18px",
  cursor : "pointer",
  fontFamily : "Oswald",
  fontSize : 16
})

export default Dashboard