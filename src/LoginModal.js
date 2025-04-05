import React from "react";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose, handleGoogleLogin }) => {
  if (!isOpen) return null;

  const redirectToGoogleLogin = () => {
    window.location.href = "https://api.bitoracle.shop/oauth2/authorization/google";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>로그인</h2>
        {/* 구글 로그인 버튼 */}
        <button className="login-button google" onClick={redirectToGoogleLogin}>
          Google 계정으로 로그인
        </button>
        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default LoginModal;