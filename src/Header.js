import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    fetch("https://api.bitoracle.shop/api/auth/init", {
      method: "GET",
      credentials: "include", // refresh 쿠키 전송
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access) {
          localStorage.setItem("access", data.access);
          console.log("access_token from /api/auth/init:", data.access);
          setIsLoggedIn(true);
        } else {
          console.log("⛔ 로그인되지 않음");
          setIsLoggedIn(false);
        }
      })
      .catch((err) => {
        console.error("❌ /api/auth/init 요청 실패:", err);
        setIsLoggedIn(false);
      });
  }, []);

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