import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Header;