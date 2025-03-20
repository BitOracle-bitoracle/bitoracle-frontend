import React from "react";
import { useNavigate } from "react-router-dom"; // React Router
import "./Header.css"; // 스타일 파일

const Header = () => {
    const navigate = useNavigate(); // React Router hook
    return (
        <header className="header">
            <div className="header-left">
                <button className="logo-btn" onClick={() => navigate("/")}>
                    <img src="/BitOracle_Logo(demo).png" alt="BitOracle Logo" className="logo" />
                </button>
                <nav className="nav">
                    <a href="/">암호화폐</a>
                    <a href="/community">커뮤니티</a>
                    <a href="/news">뉴스</a>
                    <a href="/service">서비스</a>
                </nav>
            </div>
            <div className="header-right">
                <input type="text" placeholder="검색" className="search-bar" />
                <span className="icon">📊 포트폴리오</span>
                <span className="icon">⭐ 관심 목록</span>
                <span className="icon">👤 마이페이지</span>
                <button className="login-btn">로그인</button>
            </div>
        </header>
    );
};

export default Header;