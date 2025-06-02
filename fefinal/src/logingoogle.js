import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './style/Login.css';

function GoogleLoginGemini() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log("Google Access Token:", tokenResponse.access_token);
      // 👉 Sau khi đăng nhập thành công, chuyển hướng đến trang home
      navigate('/home');
    },
    onError: () => {
      console.log('Google Login Failed');
      alert('Đăng nhập Google thất bại. Vui lòng thử lại.');
    },
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  });

  return (
    <div>
      <button onClick={login}>Login with Google</button>
    </div>
  );
}

export default GoogleLoginGemini;
