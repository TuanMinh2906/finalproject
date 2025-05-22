import React from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Thêm import này
import './style/Register.css';

function Register() {
  const navigate = useNavigate(); // 👈 hook để điều hướng

  const handleLogoClick = () => {
    navigate('/'); // 👈 Chuyển về trang chủ ("/" tức là LoginForm)
  };

  return (
    <div className="register-page">
      <header className="register-header">
        <h1 className="register-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          Planova
        </h1>
      </header>

      <div className="register-form-container">
        <form className="register-form">
          <input type="text" placeholder="Username" className="register-input" />
          <input type="email" placeholder="Email" className="register-input" />
          <input type="password" placeholder="Password" className="register-input" />
          <input type="password" placeholder="Confirm Password" className="register-input" />
          <button type="submit" className="register-submit-button">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
