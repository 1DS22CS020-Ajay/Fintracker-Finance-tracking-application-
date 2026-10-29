import React from 'react'
import Custombutton from './Custombutton'
import { useNavigate, useLocation } from 'react-router-dom';


const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard',path : '/dashboard'},
    { label: 'Transactions',path : '/transactions'},
    { label: 'Budgets',path : '/budgets'},
    { label: 'Analytics',path : '/analytics'},
    { label: 'Settings',path : '/settings'},
  ];
  return (
    <>
    <div className = "sidebar" style = {{display : "flex", flexDirection : "column", alignItems : "center", padding : 30, backgroundColor : "#093FC8",borderRadius : 10, height : "100vw", color : "white",width : 100, fontFamily : "Oswald"}}>
        {menuItems.map((item)=>(
        <React.Fragment key = {item.path}>
          <Custombutton
            bg = "#093FC8"
            function = {()=>navigate(item.path)}
          >
            {item.label}
            </Custombutton>
            <br/>  
        </React.Fragment>
      ))}
    </div>
    </>
  )
}

export default Sidebar;