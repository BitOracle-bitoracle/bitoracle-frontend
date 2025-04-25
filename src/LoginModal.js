import React from "react";
<<<<<<< HEAD
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./LoginModal.css";

const clientId = "YOUR_GOOGLE_CLIENT_ID"; // 👉 여기에 Google Client ID 입력

const LoginModal = ({ isOpen, onClose, handleGoogleLogin }) => {
  if (!isOpen) return null;

=======
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const redirectToGoogleLogin = () => {
    window.location.href = "https://api.bitoracle.shop/oauth2/authorization/google";
  };

>>>>>>> origin/main
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>로그인</h2>
        {/* 구글 로그인 버튼 */}
<<<<<<< HEAD
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log("구글 로그인 실패")}
          />
        </GoogleOAuthProvider>
=======
        <button className="login-button google" onClick={redirectToGoogleLogin}>
          Google 계정으로 로그인
        </button>
>>>>>>> origin/main
        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default LoginModal;