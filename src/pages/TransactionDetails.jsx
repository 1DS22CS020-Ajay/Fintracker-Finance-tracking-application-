import React, { useState,useEffect } from 'react'
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { apiRequest } from '../api/api';
import { useParams,useNavigate } from 'react-router-dom';
const TransactionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [transaction,setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(()=> {
        const fetchTransaction = async () => {
            try{
               setLoading(true);
               setError('');

               const data = await apiRequest(`/transactions/${id}`);
               setTransaction(data.transaction ?? data);
            }catch(err){
               setError(err.message || 'Failed to fetch transaction.');
            }finally{
                setLoading(false);
            }
        };

        fetchTransaction();
    },[id]);
  return (
    <div>
    <Navbar/>
    <div style = {{display : "flex"}}>
      <Sidebar/>
      <div style = {{display : "flex",flexDirection : 'column',justifyContent : "space-between",fontFamily : "Oswald",color : "black",width : 800,height : 500,minHeight: 400,border : "1px solid black",marginTop : 40}}>
         <h2>Transaction Details</h2>

         {loading && <p>Loading...</p>}

         {!loading && error && (
            <p style = {{color : "red"}}>{error}</p>
         )}

         {!loading && !error && transaction && (
            <>
               <div>TRANSACTION ID: {transaction.id}</div>
               <div style={{ borderBottom: '1px dotted black' }} />

               <div>TYPE: {transaction.type}</div>
               <div style={{ borderBottom: '1px dotted black' }} />
               
               <div>
                AMOUNT: ₹{Number(transaction.amount).toFixed(2)}
               </div>
               <div style={{ borderBottom: '1px dotted black' }} />
               
               <div>CATEGORY: {transaction.category}</div>
               <div style={{ borderBottom: '1px dotted black' }} />

               <div>DESCRIPTION: {transaction.description}</div>
               <div style={{ borderBottom: '1px dotted black' }} />

               <div>
                DATE: {new Date(transaction.date).toLocaleDateString('en-IN')}
               </div>
            </>
         )}
        
        <button
            onClick={() => navigate('/transactions')}
            style={{
              backgroundColor: '#093FC8',
              color: 'white',
              fontFamily: 'Oswald',
              marginTop: 20,
              padding: 10,
              borderRadius: 5,
              alignSelf: 'flex-start',
            }}
          >Back to transactions
          </button>
      </div>
    </div>
    </div>
  )
}

export default TransactionDetails;