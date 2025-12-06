import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    point: 0,
    user_type: ""
  });
  const [myPosts, setMyPosts] = useState([]);
  const [showPosts, setShowPosts] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFetchPosts = async () => {
    if (showPosts) {
      // 이미 열려 있으면 닫기
      setShowPosts(false);
      return;
    }
    // 열려 있지 않으면 API 호출
    try {
      const res = await fetch("https://api.bitoracle.shop/api/community/my-posts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        },
        // credentials: "include"
      });
      if (!res.ok) throw new Error("작성글 목록 조회 실패");
      const data = await res.json();
      setMyPosts(data);
      setShowPosts(true);
    } catch (err) {
      console.error("❌ /api/community/my-posts 오류:", err);
    }
  };

  React.useEffect(() => {
    fetch("https://api.bitoracle.shop/api/auth/init", {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        const token = data.access || data.accessToken;
        if (token) {
          localStorage.setItem("access", token);
          setIsLoggedIn(true);

          if (data.user) {
            setUserInfo(prev => ({
              ...prev,
              email: data.user.email,
              name: data.user.nickname || data.user.name || data.user.email.split("@")[0],
              user_type: data.user.user_type,
              point: data.user.point
            }));
          }
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch((err) => {
        if (err.message && err.message.includes("Refresh token mismatch")) {
          setIsLoggedIn(false);
        } else {
          console.error("❌ /api/auth/init 요청 실패:", err);
          setIsLoggedIn(false);
        }
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  // Fetch detailed user info after auth checked and login
  useEffect(() => {
    if (!authChecked || !isLoggedIn) return;
    fetch("https://api.bitoracle.shop/api/mypage/userinfo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json"
      }
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(json => {
        const info = json.data;
        setUserInfo(prev => ({
          ...prev,
          point: info.point,
          user_type: info.user_type,
          name: info.nickname
        }));
      })
      .catch(err => {
        console.error("❌ /api/mypage/userinfo 오류:", err);
      });
  }, [authChecked, isLoggedIn, isLoginModalOpen]);

  const handleLogout = async () => {
    try {
      await fetch("https://api.bitoracle.shop/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("❌ Logout failed", err);
    }

    localStorage.removeItem("access");
    document.cookie = "access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (e, path) => {
    e.preventDefault();
    closeMobileMenu();
    navigate(path);
  };

  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  const handlePortfolioClick = (e) => {
    e.preventDefault();
    closeMobileMenu();
    const token = localStorage.getItem("access");
    if (!token && !isLocalhost) {
      alert("로그인이 필요합니다.");
      setIsLoginModalOpen(true);
    } else {
      navigate("/portfolio");
    }
  };

  const handleProtoClick = (e) => {
    e.preventDefault();
    closeMobileMenu();
    const token = localStorage.getItem("access");
    if (!token && !isLocalhost) {
      alert("로그인이 필요합니다.");
      setIsLoginModalOpen(true);
    } else {
      navigate("/proto");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="logo-btn" onClick={() => {
          navigate("/");
          window.scrollTo(0, 0);
          window.location.reload();
          closeMobileMenu();
        }}>
          <img src="/BitOracle_Logo_demo.png" alt="BitOracle Logo" className="logo" />
        </button>
        <nav className="nav desktop-nav">
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
              }, 200);
            }}
          >
            암호화폐
          </a>
          <a href="/community" onClick={(e) => handleNavClick(e, "/community")}>커뮤니티</a>
          <a href="/news" onClick={(e) => handleNavClick(e, "/news")}>뉴스</a>
        </nav>
      </div>
      <nav className="nav desktop-nav header-right-nav">
        <a href="#" className="nav-link" onClick={handlePortfolioClick}>
          포트폴리오
        </a>
        <a href="#" className="nav-link" onClick={handleProtoClick}>
          차트예측
        </a>

        {authChecked && isLoggedIn ? (
          <div 
            className="mypage-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={dropdownRef}
          >
            <a
              href="#"
              className="nav-link mypage-link"
              onClick={toggleDropdown}
            >
              마이페이지
            </a>
            {isDropdownOpen && (
              <div className="mypage-dropdown">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=random`}
                  alt="프로필"
                  className="profile-pic"
                />
                <p className="nickname">{userInfo.name}</p>
                <p className="points">포인트: {userInfo.point.toLocaleString()}pt</p>
                <button className="dropdown-btn" onClick={handleFetchPosts}>작성글 목록</button>
                <button className="dropdown-btn" onClick={handleLogout}>로그아웃</button>
                {showPosts && (
                  <ul className="mypage-posts">
                    {myPosts.length === 0 ? (
                      <li className="no-posts">작성한 글이 없습니다.</li>
                    ) : (
                      myPosts.map(post => (
                        <li key={post.id}>
                          <a
                            href={`/community/${post.id}`}
                            className="post-link"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/community/post/${post.id}`);
                              setIsDropdownOpen(false);
                              setShowPosts(false);
                              closeMobileMenu();
                            }}
                          >
                            {post.title}
                          </a>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : (
          <a href="#" className="nav-link login-btn" onClick={() => {
            setIsLoginModalOpen(true);
            closeMobileMenu();
          }}>로그인</a>
        )}
      </nav>
      
      {/* 모바일 햄버거 메뉴 버튼 */}
      <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="메뉴">
        <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
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
              }, 200);
              closeMobileMenu();
            }}
          >
            암호화폐
          </a>
          <a href="/community" onClick={(e) => handleNavClick(e, "/community")}>커뮤니티</a>
          <a href="/news" onClick={(e) => handleNavClick(e, "/news")}>뉴스</a>
          <a href="#" onClick={handlePortfolioClick}>포트폴리오</a>
          <a href="#" onClick={handleProtoClick}>차트예측</a>
          
          {authChecked && isLoggedIn ? (
            <>
              <a
                href="#"
                className="mobile-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                마이페이지
              </a>
              {isDropdownOpen && (
                <div className="mobile-dropdown">
                  <div className="mobile-dropdown-content">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=random`}
                      alt="프로필"
                      className="profile-pic"
                    />
                    <p className="nickname">{userInfo.name}</p>
                    <p className="points">포인트: {userInfo.point.toLocaleString()}pt</p>
                    <button className="dropdown-btn" onClick={handleFetchPosts}>작성글 목록</button>
                    <button className="dropdown-btn" onClick={handleLogout}>로그아웃</button>
                    {showPosts && (
                      <ul className="mypage-posts">
                        {myPosts.length === 0 ? (
                          <li className="no-posts">작성한 글이 없습니다.</li>
                        ) : (
                          myPosts.map(post => (
                            <li key={post.id}>
                              <a
                                href={`/community/${post.id}`}
                                className="post-link"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/community/post/${post.id}`);
                                  setIsDropdownOpen(false);
                                  setShowPosts(false);
                                  closeMobileMenu();
                                }}
                              >
                                {post.title}
                              </a>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <a href="#" className="mobile-login-btn" onClick={() => {
              setIsLoginModalOpen(true);
              closeMobileMenu();
            }}>로그인</a>
          )}
        </nav>
      </div>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Header;