import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose }) => {
  // 모달이 열릴 때 body에 블러 클래스 추가
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // cleanup
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const redirectToGoogleLogin = () => {
    window.location.href = "http://3.36.74.196:8080/oauth2/authorization/google";
  };

  // Portal을 사용해서 body에 직접 렌더링 (blur 영향 받지 않도록)
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>BitOracle 로그인</h2>
        <p>소셜 계정으로 간편하게 시작하세요</p>
        <button className="login-button google" onClick={redirectToGoogleLogin}>
          Google로 계속하기
        </button>
        <button className="close-btn" onClick={onClose}>닫기</button>
      </div>
    </div>,
    document.body
  );
};

export default LoginModal;
