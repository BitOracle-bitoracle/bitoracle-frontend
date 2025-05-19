import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
  });

  React.useEffect(() => {
    fetch("https://api.bitoracle.shop/api/auth/init", {
      method: "GET",
      credentials: "include", // refresh 쿠키 전송
    })
      .then((res) => res.json())
      .then((data) => {
        const token = data.access || data.accessToken;
        if (token) {
          localStorage.setItem("access", token);
          console.log("✅ access_token from /api/auth/init:", token);
          setIsLoggedIn(true);

          // 사용자 정보 저장
          if (data.user) {
            setUserInfo({
              email: data.user.email,
              name: data.user.name || data.user.email.split("@")[0],
            });
          }
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

  /*
  useEffect(() => {
    setIsLoggedIn(true);
    setUserInfo({
      email: "geonyeong@gmail.com",
      name: "geonyeong",
    });
  }, []);
  */

  const handleLogout = async () => {
    try {
      await fetch("https://api.bitoracle.shop/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("❌ Logout failed", err);
    }

    localStorage.removeItem("access");
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    window.location.href = "/";
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200); // delay before closing
  };

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <button className="logo-btn" onClick={() => {
          navigate("/");
          window.scrollTo(0, 0);
          window.location.reload();
        }}>
          <img src="/BitOracle_Logo(demo).png" alt="BitOracle Logo" className="logo" />
        </button>
        <nav className="nav">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
              setTimeout(() => {
                const section = document.getElementById("coin-list-section");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }, 200); // short delay to ensure page has navigated
            }}
          >
            암호화폐
          </a>
          <a href="/community">커뮤니티</a>
          <a href="/news">뉴스</a>
        </nav>
      </div>
      <nav className="nav">
        <a href="#" className="nav-link">알림</a>
        <a href="/portfolio" className="nav-link">포트폴리오</a>
        <a href="/proto" className="nav-link">차트예측</a>

        {isLoggedIn ? (
          <div
            className="mypage-container"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <a href="#" className="nav-link">마이페이지</a>
            {isDropdownOpen && (
              <div className="mypage-dropdown">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=random`}
                  alt="프로필"
                  className="profile-pic"
                />
                <p className="nickname">{userInfo.name}</p>
                <p className="points">포인트: 90pt</p>
                <button className="dropdown-btn">작성글 목록</button>
                <button className="dropdown-btn" onClick={handleLogout}>로그아웃</button>
              </div>
            )}
          </div>
        ) : (
          <a href="#" className="nav-link login-btn" onClick={() => setIsLoginModalOpen(true)}>로그인</a>
        )}
      </nav>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Header;