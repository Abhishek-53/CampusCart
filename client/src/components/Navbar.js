// client/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import Auth from './Auth';
import './Navbar.css'; // We'll create this file next for styling

function Navbar({ user }) {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">CampusCart</Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/sell">Sell Item</Link></li>
        {/* --- ADD THIS LINE --- */}
        {user && user.role === 'Admin' && (
          <li><Link to="/admin">Admin</Link></li>
        )}
        {/* ------------------- */}
      </ul>
      <div className="nav-auth">
        <Auth user={user} />
      </div>
    </nav>
  );
}

export default Navbar;