import React from 'react'
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import TransactionForm from './pages/TransactionForm';
import Register from './pages/Register';
import Login from './pages/Login';
import TransactionDetails from './pages/TransactionDetails';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';

function App() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "2026-10-07",
      description: "Dinner",
      category: "Food",
      amount: -850
    },
    {
      id: 2,
      date: "2026-10-06",
      description: "Outing",
      category: "Transport",
      amount: -200
    },
    {
      id: 3,
      date: "2026-10-05",
      description: "Shopping",
      category: "buying",
      amount: -1500
    },
    {
      id: 4,
      date: "2026-10-04",
      description: "Salary",
      category: "Salary",
      amount: 50000
    }
  ]);
  const addTransaction = (newTransaction) => {
    setTransactions((previousTransactions) => [
      ...previousTransactions,
      newTransaction
    ]);
  };
  return (
     <BrowserRouter>
      <Routes>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route 
          path = "/transactions"
          element = {<Transactions transactions = {transactions}/>}
        />
        <Route
          path="/transactions/add"
          element={
            <TransactionForm
              addTransaction={addTransaction}
            />
          }
          />
        <Route
           path = "/Register"
           element = {<Register/>}
         />
         <Route
           path = "/Login"
           element = {<Login/>}
         />
         <Route 
           path = "/transactions/:id"
           element = {<TransactionDetails/>}
         />
         <Route
           path = "/budgets" element = {<Budgets/>}
         />
         <Route 
           path = "/analytics" element = {<Analytics/>}
         />          
      </Routes>
     </BrowserRouter>
  )
}

export default App
