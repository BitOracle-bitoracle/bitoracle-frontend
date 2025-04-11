import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleGoogleLogin = async (response) => {
    console.log("Google login response:", response);
    
    // 구글 로그인에서 받은 정보 중 code 추출
    const { credential } = response;
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        // 페이지 새로고침 (setItem이 적용되지 않는 문제 방지)
        window.location.reload();
      }
    } catch (error) {
      console.error("구글 로그인 처리 중 오류 발생:", error);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="logo-btn" onClick={() => navigate("/")}>
          <img src="/BitOracle_Logo(demo).png" alt="BitOracle Logo" className="logo" />
        </button>
        <nav className="nav">
          <a href="/cryptos">암호화폐</a>
          <a href="/community">커뮤니티</a>
          <a href="/news">뉴스</a>
        </nav>
      </div>
      <div className="header-right">
        <button className="icon-btn">🔔 알림</button>
        <button className="icon-btn" onClick={() => navigate("/portfolio")}>📊 포트폴리오</button>

        {isLoggedIn ? (
          <button className="icon-btn">👤 마이페이지</button>
        ) : (
          <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>로그인</button>
        )}
      </div>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} handleGoogleLogin={handleGoogleLogin} />
    </header>
  );
};

export default Header;