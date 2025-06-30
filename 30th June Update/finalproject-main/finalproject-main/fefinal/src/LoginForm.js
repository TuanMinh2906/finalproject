// src/LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginGemini from './logingoogle';
import './style/Login.css';

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8003/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu token và userId vào localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);

        // Gọi API để lấy calendarId theo userId
        const calendarResponse = await fetch(`http://localhost:8003/api/calendar/user/${data.userId}`, {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });

        const calendarData = await calendarResponse.json();

        if (calendarResponse.ok) {
          localStorage.setItem('calendarId', calendarData.calendarId);
          navigate('/home');
        } else {
          alert('Failed to retrieve calendar information.');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <h1 className="login-logo" onClick={() => navigate('/')}>Planova</h1>
      </header>

      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">Login</button>
          <button type="button" className="register-button" onClick={handleRegisterClick}>
            Register
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <GoogleLoginGemini />
        </div>
      </div>
    </div>
  );
}

export default LoginForm;