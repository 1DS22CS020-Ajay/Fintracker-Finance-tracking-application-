import React from 'react'
import Banner from '../components/Banner'
import LoginForm from '../components/LoginForm'

const Login = () => {
  return (
    <div style = {{display : "flex"}}>
        <div style = {{flex : 1}}>
            <Banner/>
        </div>
        <div style = {{flex : 1,marginTop : 50}}>
            <LoginForm/>
        </div>

    </div>
  )
}

export default Login