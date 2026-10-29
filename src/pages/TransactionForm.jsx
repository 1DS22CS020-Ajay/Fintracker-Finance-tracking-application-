import React, { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { apiRequest } from '../api/api';

const TransactionForm = ({ addTransaction }) => {
  const [type, setType] = useState("Income");
  const [category,setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading,setLoading] = useState(true);
  const [budgets,setBudgets] = useState([]);
  const [budgetId,setBudgetId] = useState("");
  const [budgetError,setBudgetError] = useState("");

  useEffect(() =>{
    const fetchBudgets = async () => {
      try{
        const data = await apiRequest("/budgets/all");
        setBudgets(data.budgets ?? []);
      }catch(err){
        setBudgetError(err.message || "Failed to load budgets.");
      }
    };
    fetchBudgets();
  },[]);
  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    try{
      await apiRequest("/transactions/create",{
          method : "POST",
          body : JSON.stringify({
            description : description.trim(),
            amount : Number(amount),
            category,
            type,
            date,
            budgetId : budgetId ? Number(budgetId) : null,
          }),
      });

      navigate("/transactions");
    }catch(err){
      setError(err.message || "Failed to add transaction")
    }finally{
      setLoading(false);
    }
  }
  return (
    <div style = {{display: "flex", flexDirection: "column", height: "100vh"}}>
    <Navbar/>
    <div style = {{display : "flex",flex: 1, overflow: "hidden"}}>
       <Sidebar/>
       <div className='transaction-form' style = {{marginLeft : 20,flex : 1,overflowY : "auto",paddingBottom : 40}}>
        <div style = {{fontFamily : "Oswald",color : "white",backgroundColor : "#638DF8",width : 800,fontSize : 40,padding : 20,borderRadius : 10}}>Add transactions</div>
        <br/>
        <p style = {{fontFamily : "Oswald",fontSize : 20}}>Type</p>
        <div style = {{border : "1px solid black",width : 500}}></div>
        <br/>
        <div>
        <label style = {{fontFamily : "Oswald",color : "black",fontSize : 20}}>
        <input
          type="radio"
          name="type"
          value="Income"
          checked={type === "Income"}
          onChange={(e) => setType(e.target.value)}
        />
        Income
      </label>

      <label style = {{fontFamily : "Oswald",color : "black",fontSize : 20}}>
        <input
          type="radio"
          name="type"
          value="Expense"
          checked={type === "Expense"}
          onChange={(e) => setType(e.target.value)}
        />
        Expense
      </label>

      <p style = {{fontFamily : "Oswald",color : "black",fontSize : 20}}>Selected: {type}</p>
      </div>
      <br/>
      <br/>
      <p style = {{fontFamily : "Oswald",color : "black",fontSize : 20}}>Amount</p>
      <div style = {{border : "1px solid black",width : 500}}></div>
      <br/>
      <input type = "number" name = "amount" placeholder = "Add amount" value = {amount} onChange = {(e)=> setAmount(e.target.value)}/>
      <br/>
      <br/>
      <p style = {{fontFamily : "Oswald",color : "black",fontSize : 20}}>Category</p>
      <div style = {{border : "1px solid black",width : 500}}></div>
      <br/>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>
        <option value="Food">Food</option>
        <option value="Shopping">Shopping</option>
        <option value="Transport">Transport</option>
        <option value="Bills">Bills</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Salary">Salary</option>
        <option value="Stay">Stay</option>
      </select>

      <p style = {{fontFamily : "Oswald",color : "black",fontSize : 20}}>Selected category: {category}</p>
      
<br />
<br />
<p style={{ fontFamily: "Oswald", color: "black", fontSize: 20 }}>
  Assign to Budget?
</p>
<div style={{ border: "1px solid black", width: 500 }}></div>
<br />

<select
  value={budgetId}
  onChange={(e) => setBudgetId(e.target.value)}
>
  <option value="">No budget</option>

  {budgets.map((budget) => (
    <option key={budget.id} value={budget.id}>
      {budget.name} — ₹{Number(budget.amount).toLocaleString("en-IN")}
    </option>
  ))}
</select>

{budgetError && (
  <p style={{ color: "red" }}>{budgetError}</p>
)}

<br />
<br />

      <p style = {{fontFamily : "Oswald",color : "black",fontSize : 20}}>Description</p>
      <div style = {{border : "1px solid black",width : 500}}></div>
      <br/>
      <input type = "text" placeholder = "enter one word" className='desc' value={description} onChange={(e) => setDescription(e.target.value)}/>
      <br/>
      <br/>
      <p style = {{fontFamily : "Oswald",color : "black",fontSize : 20}}>Date</p>
      <div style = {{border : "1px solid black",width : 500}}></div>
      <br/>
      <input type = "date" placeholder = "enter date" className='DOT' value={date} onChange={(e) => setDate(e.target.value)}/>
      <br/>
      {error && <p style = {{color : "red"}}>{error}</p>}
      <button type = "button" onClick={handleSubmit} style = {{backgroundColor : "#093FC8", fontFamily : "Oswald",color : "white",marginTop : 20}}>
        Add 
      </button>
      </div>
    </div>
    </div>
  )
}

export default TransactionForm