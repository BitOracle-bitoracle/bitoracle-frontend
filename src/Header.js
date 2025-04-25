<<<<<<< HEAD
import React, { useState } from "react";
=======
import React, { useState, useEffect, useRef } from "react";
>>>>>>> origin/main
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
<<<<<<< HEAD
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

=======
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

>>>>>>> origin/main
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
<<<<<<< HEAD
          <button className="icon-btn">👤 마이페이지</button>
=======
          <div
            className="mypage-container"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="icon-btn">👤 마이페이지</button>
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
>>>>>>> origin/main
        ) : (
          <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>로그인</button>
        )}
      </div>

      {/* 로그인 모달 */}
<<<<<<< HEAD
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} handleGoogleLogin={handleGoogleLogin} />
=======
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
>>>>>>> origin/main
    </header>
  );
};

export default Header;