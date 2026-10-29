import React from 'react'
import Banner from '../components/Banner'
import LoginForm from '../components/LoginForm'

const Register = () => {
  return (
    <div style = {{display : "flex"}}>
        <div style = {{flex : 1}}>
            <Banner/>
        </div>
        <div style = {{flex : 1,marginTop : 50}}>
             <LoginForm isRegister = 'true'/>
        </div>
    </div>
  )
}

export default Register