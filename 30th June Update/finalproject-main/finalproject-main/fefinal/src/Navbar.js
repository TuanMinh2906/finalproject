// src/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './style/Navbar.css'; // Dùng chung file CSS

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Có thể thêm logic xoá token, session ở đây nếu cần
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/home')}>
        Planova
      </div>
      <div className="navbar-links">
        <button onClick={() => navigate('/home')}>Home</button>
        <button onClick={() => navigate('/calendar')}>Calendar</button>
        <button onClick={() => navigate('/profile')}>Profile</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
