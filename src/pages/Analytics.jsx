import React, { useState,useEffect } from 'react';
import { apiRequest } from "../api/api.js";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

const COLORS = [
    "#093FC8",
    "#638DF8",
    "#16AD4A",
    "#F59E0B",
    "#DC2626",
    "#9333EA",
    "#0891B2",
    "#64748B",
];

const SummaryCard = ({ title, value}) => (
  <div style = {{backgroundColor : 'white',padding : 24,borderRadius : 10,boxShadow : "0 2px 8px rgba(0,0,0,0.08)",fontFamily : "Oswald"}}>
    <p style = {{color : "#64748b",fontSize : 16,marginTop : 0}}>
      {title}
    </p>
    <h2 style = {{color : "#093FC8",fontSize : 28,marginBottom : 0}}>
      {value}
    </h2>
  </div>
);

const Analytics = () => {
  const [transactions,setTransactions] = useState([]);
  const [period, setPeriod] = useState("month");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  
  useEffect(() => {
    const fetchTransactions = async () => {
        try{
           setError("");
           const data = await apiRequest("/transactions/all");
           setTransactions(data.transactions ?? []);
        }catch(err){
           setError(err.message || "Failed to load analytics.");
        }finally{
           setLoading(false);
        }
    };

    fetchTransactions();
  },[]);

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
  const date = new Date(transaction.date);

  return (
    !Number.isNaN(date.getTime()) && date >= startDate && date <= now 
  );
})

const income = filteredTransactions.reduce((total, transaction) => {
  return transaction.type?.toLowerCase() === "income" ? total + Number(transaction.amount) : total;
}, 0);

const expenses = filteredTransactions.reduce((total, transaction) => {
  return transaction.type?.toLowerCase() === "expense" ?  total + Number(transaction.amount) : total;
}, 0);

const savings = income - expenses;

const savingsRate = income > 0 ? (savings/income)*100 : 0;

const formatCurrency = (value) => 
  Number(value).toLocaleString("en-IN", {
    maximumFractionDigits : 2,
  });

const monthlyData = {};

filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;

    if(!monthlyData[key]){
        monthlyData[key] = {
            month: date.toLocaleDateString("en-IN",{
                month : "short",
                year : "2-digit",
            }),
            income : 0,
            expenses : 0, 
        };
    }

    if(transaction.type?.toLowerCase() === "income"){
        monthlyData[key].income += Number(transaction.amount);
    }else if(transaction.type?.toLowerCase() === "expense"){
        monthlyData[key].expenses += Number(transaction.amount);
    }
});

const monthlyChartData = Object.entries(monthlyData).sort(([a],[b]) => a.localeCompare(b)).map(([,value]) => value);
const categoryTotals = {};

filteredTransactions.forEach((transaction) => {
    if(transaction.type?.toLowerCase() !== "expense"){
        return;
    }

    const category = transaction.category || "Others";

    categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount);
});

const categoryChartData = Object.entries(categoryTotals).map(([name,value]) => ({ name, value})).sort((a,b) => b.value - a.value);

  return (
    <div style = {{display : "flex",flexDirection : "column",height : "100vh"}}>
     <Navbar/>
     <div style = {{display : "flex",flex : 1,overflow : "hidden"}}>
        <Sidebar/>
        <main style = {{flex : 1,overflowY : "auto",padding : 24,backgroundColor : "#f5f7ff"}}>
          <h1 style = {{fontFamily : "Oswald",color : "white",backgroundColor : "#638DF8",padding : 20,borderRadius : 10,fontSize : 36,marginTop : 0}}>
            Financial Analytics
          </h1>

          <div style = {{display : "flex",justifyContent : "center",gap : 10,flexWrap : "wrap",marginBottom : 24}}>
            {[
                { label: "1 Month", value : "month"},
                { label: "6 Months", value : "sixMonths"},
                { label: "1 Year", value : "year"},
            ].map((option) => (
                <button
                   key = {option.value}
                   onClick = {() => setPeriod(option.value)}
                   style = {{backgroundColor: period === option.value ? "#093FC8" : "white" ,color : period === option.value ? "white" : "#093FC8",border: "1px solid #093FC8",borderRadius: 6,padding: "10px 18px", cursor: "pointer",fontFamily: "Oswald",fontSize: 16,}}
                >
                    {option.label}
                </button>    
            ))}
          </div>

          {error && (<p style = {{color : "red"}}>{error}</p>)}
          {loading ? (<p>Loading Analytics...</p>) : (
            <>
              <div style = {{display : "grid",gridTemplateColumns : "repeat(auto-fit,minmax(210px,1fr))",gap : 20,marginBottom : 24}}>
                <SummaryCard title = "Total Income" value = {formatCurrency(income)}/>
                <SummaryCard title = "Total Expenses" value = {formatCurrency(expenses)}/>
                <SummaryCard title = "Total Savings" value = {formatCurrency(savings)}/>
                <SummaryCard title = "Savings Rate" value = {`${savingsRate.toFixed(1)}%`}/>
              </div>
              <section style = {sectionStyle}>
                <h2 style = {headingStyle}>
                  Monthly Income vs Expenses
                </h2>
                {monthlyChartData.length === 0 ? (
                  <p>No transactions data for this period.</p>
                ):(
                  <div style = {{width : "100%",height : 340}}>
                    <ResponsiveContainer width = "100%" height = "100%">
                      <BarChart data = {monthlyChartData} margin = {{top : 10,right : 20,left : 15,bottom : 5}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey= "month"/>
                        <YAxis tickFormatter = {(value) => value.toLocaleString("en-IN")}/>
                        <Tooltip formatter = {(value) => formatCurrency(value)}/>
                        <Legend/>
                        <Bar dataKey = "income" name = "Income" fill = "#093FC8" radius = {[4,4,0,0]}/>
                        <Bar dataKey = "expenses" name = "Expenses" fill = "#F59E0B" radius = {[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>
              <section style = {sectionStyle}>
                 <h2 style = {headingStyle}>
                  Spending By Category
                 </h2>
                 {categoryChartData.length === 0 ? (
                  <p>No expenses transactions for this period.</p>
                 ) : (
                  <div style = {{display : "grid",gridTemplateColumns : "repeat(auto-fit, minmax(260px, 1fr))",alignItems : "center",gap : 20}}>
                    <div style = {{width : "100%",height : 320}}>
                      <ResponsiveContainer width = "100%" height = "100%">
                        <PieChart>
                          <Pie data = {categoryChartData} dataKey= "value" nameKey = "name" cx = "50%" cy = "50%" outerRadius = {105} label = {({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                            {categoryChartData.map((entry,index) => (
                              <Cell key = {entry.name} fill = {COLORS[index%COLORS.length]}/>
                            ))}
                          </Pie>
                          <Tooltip formatter = {(value) => formatCurrency(value)} />
                          <Legend/>  
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      {categoryChartData.map((category, index) => (
                        <div key = {category.name} style = {{display : "flex",justifyContent : "space-between",gap : 16,padding : "12px 0",borderBottom : "1px solid #e5e7eb",fontFamily : "Oswald"}}>
                          <span>
                             <span style = {{display : "inline-block",width : 10,height : 10,borderRadius : 3,backgroundColor : COLORS[index%COLORS.length],marginRight : 8}}/>
                             {category.name}
                          </span>
                          <strong>{formatCurrency(category.value)}</strong>
                        </div>  
                      ))}
                    </div>
                  </div>
                 )}
              </section>
            </>
          )}
        </main>
     </div>
    </div>
  )
}

const sectionStyle = {
  backgroundColor : "white",
  padding : 24,
  borderRadius : 10,
  marginBottom : 24,
  boxShadow : "0 2px 8px rgba(0,0,0,0.08)",
  minWidth : 0
}

const headingStyle = {
  fontFamily : "Oswald",
  marginTop : 0,
  marginBottom : 20
}


export default Analytics