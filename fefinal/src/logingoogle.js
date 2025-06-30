import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './style/Login.css';

function GoogleLoginGemini() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("🔐 Google Access Token:", tokenResponse.access_token);

      try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const user = res.data;

        // Log thông tin người dùng
        console.log("🟢 Đăng nhập thành công:");
        console.log(`👤 Tên: ${user.name}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🖼️ Ảnh đại diện: ${user.picture}`);

        // Không kiểm tra email nữa → cho phép mọi user
        setUserInfo(user);
        navigate('/home');
      } catch (err) {
        console.error("❌ Lỗi khi lấy thông tin người dùng:", err);
        alert("Không thể lấy thông tin người dùng từ Google.");
      }
    },
    onError: () => {
      console.log('❌ Google Login Failed');
      alert('Đăng nhập Google thất bại. Vui lòng thử lại.');
    },
    scope: 'openid email profile',
  });

  return (
    <div>
      <button onClick={login} className='google-login-button'>Login with Google</button>

      {userInfo && (
        <div>
          <p>Xin chào, {userInfo.name}</p>
          <p>Email: {userInfo.email}</p>
        </div>
      )}
    </div>
  );
}

export default GoogleLoginGemini;
