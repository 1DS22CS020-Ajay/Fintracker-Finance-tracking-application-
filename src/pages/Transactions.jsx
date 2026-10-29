import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Statcard from '../components/Statcard'
import TransactionItem from '../components/TransactionItem'
import { useNavigate } from "react-router-dom";
import { useState,useEffect } from 'react';
import { apiRequest } from '../api/api';
import './Transactions.css';

const Transactions = () => {
  const navigate = useNavigate(); 
  const [searchId,setSearchId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [transactions,setTransactions] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError("");

    const id = searchId.trim();

    if(!id || !/^[1-9]\d*$/.test(id)){
      setSearchError("Please enter a valid transaction Id.");
      return;
    }

    navigate(`/transactions/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if(!confirmed) return;
    try{
      await apiRequest(`/transactions/${id}`,{
        method : "DELETE",
      });
      setTransactions((previous)=>previous.filter((t)=>t.id !== id));
    }catch(err){
      alert(err.message || "Failed to delete transactions.");
    }
  } 

  useEffect(()=>{
    const fetchTransactions = async () => {
      try{
        setLoading(true);
        setError('');

        const data = await apiRequest('/transactions/all');

        setTransactions(data.transactions ?? data);
      }catch(err){
        setError(err.message || 'Failed to fetch all transactions.');
      }finally{
        setLoading(false);
      }
    };
    
    fetchTransactions();
  },[])
  return (
    <>
      <Navbar />
      <div style = {{display : "flex"}}>
        <Sidebar/>
        <div className = "transactions" style = {{marginLeft : 20}}>
          <h1 style = {{ color : "black",fontFamily : "Oswald"}}>Transactions</h1>
      <div style = {{border : "1px solid black",width : 700}}></div>
      <form onSubmit = {handleSearch} style = {{display : 'flex',alignItems : 'center',gap : 10,marginTop : 20,marginBottom : 25,maxWidth : 700}}>
            <input type = "number" min = "1" step = "1" placeholder = "Enter transaction Id" value = {searchId} onChange={(e)=>{setSearchId(e.target.value);setSearchError("");}}
                   style = {{padding : 12,fontSize : 16,border : "1px solid #999",borderRadius : 8,flex : 1}}/>
            <button
              type = "submit"
              style = {{
                padding : "12px 22px",
                backgroundColor : "#093FC8",
                color : "white",
                border : "none",
                borderRadius : 8,
                fontFamily : "Oswald",
                cursor : "pointer"  
              }}  
            >
             Search
            </button>       
          </form>

          {searchError && (
            <p style = {{color : "red",marginTop : -15}}>{searchError}</p> 
          )}
      <br/>
      <button className = "add-transaction-btn" style = {{width : 500,height : 100,borderRadius : 10,fontFamily : "Oswald", fontSize : 30}} onClick = {()=> navigate("/transactions/add")}>+Add transaction</button>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <div className = "filter-btns-section" style = {{display : "flex"}}>
        <div style = {{marginRight : 40,color : "gray",fontFamily : "Oswald"}}>Filter by:</div>
        <button className = "All-btn" style = {{width : 150,height : 50,borderRadius : 10,backgroundColor : "#093FC8",color : "white",fontFamily : "Oswald"}}>All</button>
        <button className = "Income-btn" style = {{width : 150,height : 50,borderRadius : 10,backgroundColor : "#093FC8",color : "white",fontFamily : "Oswald"}}>Income</button>
        <button className = "Expense-btn" style = {{width : 150,height : 50,borderRadius : 10,backgroundColor : "#093FC8",color : "white",fontFamily : "Oswald"}}>Expense</button>
      </div>
      <br/>
      <br/>
      <br/>
      <div className = "headings" style = {{display : "flex", color : "black", fontFamily : "Oswald",marginRight : 40 }}>
        <h4 style = {{marginLeft : 10}}>Date</h4>
        <h4 style = {{marginLeft : 100}}>Description</h4>
        <h4 style = {{marginLeft : 100}}>Category</h4>
        <h4 style = {{marginLeft : 100}}>Amount</h4>
      </div>
      <div style = {{border : "1px dotted black",width : 550}}></div>

      {loading && <p>Loading transactions...</p>}

      {!loading && error && (
        <p style = {{color : 'red'}}>{error}</p>
      )}

      {!loading && !error && transactions.length === 0 && (
        <p>No transactions found. Add your first transaction!</p>
      )}

      {!loading && !error && [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,4).map((t) => (
        <TransactionItem date = {t.date} item = {t.description} category = {t.category} amount = {t.amount} onDelete = {()=>handleDelete(t.id)} />
      ))}
        </div>
      </div>
    </>
  )
}

export default Transactions