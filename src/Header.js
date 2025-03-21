import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [showDialog, setShowDialog] = useState(null); // 다이얼로그 상태

  const toggleDialog = (type) => {
    setShowDialog(showDialog === type ? null : type);
  };

  return (
    <header className="header">
      <div className="header-left">
        {/* 로고 버튼 */}
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
        {/* 알림 버튼 */}
        <button className="icon-btn" onClick={() => toggleDialog("notification")}>🔔 알림</button>

        {/* 포트폴리오 페이지 이동 버튼 */}
        <button className="icon-btn" onClick={() => navigate("/portfolio")}>📊 포트폴리오</button>

        {/* 로그인 상태에 따라 버튼 표시 변경 */}
        {isLoggedIn ? (
          <button className="icon-btn" onClick={() => toggleDialog("mypage")}>👤 마이페이지</button>
        ) : (
          <button className="login-btn" onClick={() => toggleDialog("login")}>로그인</button>
        )}
      </div>

      {/* 다이얼로그 창 */}
      {showDialog === "notification" && <div className="dialog">🔔 알림 목록</div>}
      {showDialog === "login" && (
        <div className="dialog">
          <h3>로그인</h3>
          <button onClick={() => setIsLoggedIn(true)}>로그인 성공</button>
        </div>
      )}
      {showDialog === "mypage" && <div className="dialog">👤 마이페이지 내용</div>}
    </header>
  );
};

export default Header;