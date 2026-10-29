import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { apiRequest } from '../api/api';

const LoginForm = ({isRegister = false}) => {
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async(e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if(!username.trim() || !password){
      setError("Please enter both username and password");
      return;
    }

    if(isRegister && password.length < 8){
      setError("Password must be atleast 8 characters long.");
      return;
    }

    if(isRegister && password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try{
      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const data = await apiRequest(endpoint , {
        method : "POST",
        body : JSON.stringify({
          username: username.trim(),
          password, 
        }),
      });

      if(isRegister){
        setMessage("Registeration successfull,please login.");
        navigate("/login");
      }else{
        localStorage.setItem("token",data.token);
        localStorage.setItem("username",data.user.username);
        navigate("/dashboard");
      }
    }catch(err){
       setError(err.message);
    }finally{
      setLoading(false);
    }
  };
  return (
    <div style = {{display : "flex",flexDirection : "column",fontFamily : "Bebas Neue",alignItems : "center",color : "#072A9C"}}>
      <h1>{isRegister ? "Register Now!!" : "Login"}</h1>
      <form onSubmit = {handleSubmit}>
         <div>
        <label style = {{color : "#072A9C"}}>Username:</label>
        <input className = "username" type = "text" placeholder = "Enter a username" value = {username} onChange={(e)=>setUsername(e.target.value)}/>
      </div>
      <br/>
      <div>
        <label style = {{color : "#072A9C"}}>Password:</label>
        <input className= "password" type = "password" placeholder = "Enter a password" value = {password} onChange = {(e)=>setPassword(e.target.value)}/>
      </div>
      <br/>
      {isRegister && (
          <>
           <div>
           <label>Re-type password:</label>
           <input className= "confirm-password" type = "password" placeholder = "Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
           </div>
           <br/>
          </>
      )}

      <br/>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <button type = "submit" disabled = {loading} style = {{fontSize : 20,color : "white",borderRadius : 5,backgroundColor : "#2750F5",fontFamily : "Bebas Neue"}}>
        {isRegister ? "Register" : "Login"}
      </button>
      </form>
      <br/>
      <br/>
    </div>
  )
}

export default LoginForm