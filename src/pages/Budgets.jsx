import React,{useState,useEffect} from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/api.js';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchBudgets = async () => {
    try{
       setError("");
       const data = await apiRequest("/budgets/all");
       setBudgets(data.budgets ?? []);
    }catch(err){
       setError(err.message || "Failed to fetch budgets");
    }finally{
       setLoading(false);
    }
  };
  useEffect(()=>{
    fetchBudgets();
  },[]);

  const handleCreateBudget = async(e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if(!name.trim() || !amount || !startDate || !endDate){
      setError("Please fill all the details.");
      return;
    }

    if(Number(amount) <= 0){
      setError("Budget amount must be greater than zero.");
      return;
    }

    if(new Date(startDate) > new Date(endDate)){
      setError("startdate must be less than or equal to end date.");
      return;
    }

    try{
       setSaving(true);

       await apiRequest("/budgets/create",{
        method : "POST",
        body : JSON.stringify({
          name : name.trim(),
          amount : Number(amount),
          category : category || null,
          startDate,
          endDate,
        }),
       });

       setName("");
       setAmount("");
       setCategory("");
       setStartDate("");
       setEndDate("");
       setMessage("Budget created successfully.");

       await fetchBudgets();
    }catch(err){
       setError(err.message || "Failed to create budget.")
    }finally{
       setSaving(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this budget?");
    if(!confirmed) return;
  try{
    setError("");
    setMessage("");

    await apiRequest(`/budgets/${id}`,{
        method : "DELETE",
    });

    setBudgets((current)=>current.filter((budget)=>budget.id !== id));
    setMessage("Budget deleted successfully.");
  }catch(err){
     setError(err.message || "failed to delete budget");
  } 
  };

  const formatCurrency = (value) => 
    Number(value ?? 0).toLocaleString("en-IN",{
      style : "currency",
      currency : "INR",
      maximumFractionDigits : 2,
    });
  return (
    <div style = {{display : "flex",flexDirection : "column",height : "100vh"}}>
      <Navbar/>
      <div style = {{display : "flex",flex : 1,overflow : "hidden"}}>
        <Sidebar/>
        <div style = {{flex : 1,overflowY : "auto",padding : 24,backgroundColor : "#f5f7ff"}}>
          <h1 style = {{fontFamily : "Oswald",color : "white",backgroundColor : "#638DF8",padding : 20,borderRadius : 10,fontSize : 36}}>
            Budgets
          </h1>
          {error && <p style = {{color : "red"}}>{error}</p>}
          {message && <p style = {{color : "green"}}>{message}</p>}
          <section style = {{backgroundColor : "white",padding : 24,borderRadius : 10,marginBottom : 28,maxWidth : 750}}>
            <h2 style = {{fontFamily : "Oswald"}}>Create a budget</h2>
            <form onSubmit = {handleCreateBudget}>
              <div style = {fieldStyle}>
                 <label htmlFor='budget-name'>Budget Name *</label>
                 <input id = "budget-name" type = "text" placeholder = "e.g Goa trip" value = {name} onChange = {(e) => setName(e.target.value)} required />
              </div>
              <div style = {fieldStyle}>
                <label htmlFor='budget-amount'>Budget Amount (₹) *</label>
                <input id = "budget-amount" type = "number" min = "0.01" step = "0.01" placeholder = "e.g. 12000" value = {amount} onChange = {(e)=>setAmount(e.target.value)} required />
              </div>
              <div style = {fieldStyle}>
                <label htmlFor='budget-category'>Category (optional)</label>
                <select id = "budget-category" value = {category} onChange = {(e)=>setCategory(e.target.value)}>
                  <option value = "">All categories</option>
                  <option value = "Food">Food</option>
                  <option value = "Shopping">Shopping</option>
                  <option value = "Transport">Transport</option>
                  <option value = "Bills">Bills</option>
                  <option value = "Entertainment">Entertainment</option>
                  <option value = "Health">Health</option>
                  <option value = "Travel">Travel</option>
                </select>
              </div>
              <div style = {fieldStyle}>
                <label htmlFor='budget-start'>Start Date *</label>
                <input id = "budget-start" type = "date" value = {startDate} onChange = {(e)=>setStartDate(e.target.value)} required />
              </div>
              <div style = {fieldStyle}>
                <label htmlFor='budget-end'>End Date *</label>
                <input id = "budget-end" type = "date" value = {endDate} min = {startDate || undefined} onChange = {(e)=>setEndDate(e.target.value)} required />
              </div>
              <button type = "submit" disabled = {saving} style = {buttonStyle}>
                {saving ? "Creating..." : "Create Budget"}
              </button>
            </form>
          </section>
          <section>
            <h2 style = {{fontFamily : "Oswald"}}>Your Budgets</h2>
            <div style = {{border : "1px solid black",width : 700}}></div>
            <br/>

            {loading ? (
              <p>Loading budgets...</p>
            ) : budgets.length === 0 ? (
              <p>You have'nt created any budgets yet.</p>
            ) : (
              <div style = {{display : "grid",gridTemplateColumns: "repeat(auto-fit, minmax(280px,350px))",gap : 20,alignItems : "start"}}>
                {budgets.map((budget) => {
                  const total = Number(budget.amount ?? 0);
                  const spent = Number(budget.totalSpent ?? 0);
                  const remaining = Number(budget.remaining ?? total - spent);
                  const percentage = total > 0 ? Math.min((spent/total)*100,100) : 0;
                  return (
                    <div key = {budget.id} style = {{backgroundColor : "white",padding : 20,borderRadius : 10,boxShadow : "0 2px 8px rgba(0,0,0,0.08)",fontFamily : "Oswald",width : "100%",boxSizing : "border-box"}}>
                      <h3 style = {{fontFamily : "Oswald"}}>
                        {budget.name}
                      </h3>

                      <p>Category : {budget.category || "All categories"}</p>
                      <p>
                        {String(budget.startDate).slice(0,10)} -{" "}
                        {String(budget.endDate).slice(0,10)}
                      </p>

                      <p>Budget : {formatCurrency(total)}</p>
                      <p>Spent : {formatCurrency(spent)}</p>
                      <p>Remaining : {formatCurrency(remaining)}</p>

                      <div style = {{height : 10,backgroundColor : "#e5e7eb",borderRadius : 10,overflow : "hidden"}}>
                        <div style = {{height : "100%",width : `${percentage}%`,backgroundColor : spent > total ? "#dc2626" : "#093FC8",borderRadius : 10}}/>
                      </div>
                      <p>{percentage.toFixed(1)}% of budget used</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteBudget(budget.id)}
                        style={{
                          ...buttonStyle,
                          backgroundColor: "#dc2626",
                          marginTop: 8,
                        }}
                      >
                        Delete budget
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const fieldStyle = {
  display : "flex",
  flexDirection : "column",
  gap : 8,
  marginBottom : 18,
  fontFamily : "Oswald"
}

const buttonStyle = {
  backgroundColor : "#093FC8",
  color : "white",
  padding : "10px 18px",
  border : "none",
  borderRadius : 6,
  cursor : "pointer",
  fontFamily : "Oswald"
};

export default Budgets