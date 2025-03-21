import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./LoginModal.css";

const clientId = "YOUR_GOOGLE_CLIENT_ID"; // 👉 여기에 Google Client ID 입력

const LoginModal = ({ isOpen, onClose, handleGoogleLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>로그인</h2>
        {/* 구글 로그인 버튼 */}
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log("구글 로그인 실패")}
          />
        </GoogleOAuthProvider>
        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default LoginModal;