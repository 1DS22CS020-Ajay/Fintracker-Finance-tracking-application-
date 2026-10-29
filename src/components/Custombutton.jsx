import React from 'react'
import './Custombutton.css';

const Custombutton = (props) => {
  return (
    <button className = "custom-button" style = {{backgroundColor : props.bg}} onClick = {props.function}>
        {props.children}
    </button>
  )
}

export default Custombutton