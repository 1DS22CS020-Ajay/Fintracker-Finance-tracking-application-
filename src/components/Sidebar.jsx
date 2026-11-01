import React from 'react'
import Custombutton from './Custombutton'
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="sidebar"
      aria-label="Main navigation"
      style={{
        position: "sticky",
        top: 64,
        flex: "0 0 210px",
        boxSizing: "border-box",
        height: "calc(100vh - 64px)",
        padding: "20px 12px",
        backgroundColor: "#093FC8",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "Oswald",
      }}
    >
      {menuItems.map((item) => (
        <Custombutton
          key={item.path}
          variant="nav"
          active={location.pathname === item.path}
          function={() => navigate(item.path)}
        >
          {item.label}
        </Custombutton>
      ))}
    </nav>
  )
}

export default Sidebar;