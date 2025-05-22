import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/Login.css';

function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple check - thực tế sẽ gọi API kiểm tra đăng nhập
    if (username && password) {
      navigate('/home'); // 👉 đăng nhập thành công thì chuyển sang homepage
    } else {
      alert('Please enter both username and password.');
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
            type="text"
            placeholder="Username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
      </div>
    </div>
  );
}

export default LoginForm;
