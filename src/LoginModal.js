import React from "react";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const redirectToGoogleLogin = () => {
    window.location.href = "https://api.bitoracle.shop/oauth2/authorization/google";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>BitOracle 로그인</h2>
        <p>소셜 계정으로 간편하게 시작하세요</p>
        <button className="login-button google" onClick={redirectToGoogleLogin}>
          Google로 계속하기
        </button>
        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default LoginModal;