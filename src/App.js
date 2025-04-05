import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import MainPage from "./Mainpage/MainPage";
import "./App.css";

function App() {
  useEffect(() => {
    fetch("https://api.bitoracle.shop/api/auth/init", {
      method: "GET",
      credentials: "include", // ✅ 쿠키 자동 전송 (refresh token)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access) {
          localStorage.setItem("access", data.access);
          console.log("✅ 로그인 상태 access 토큰 저장됨:", data.access);
        } else {
          console.log("⛔ 로그인되지 않음");
        }
      })
      .catch((err) => {
        console.error("❌ /api/auth/init 요청 실패:", err);
      });
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/cryptos" element={<h1>암호화폐 페이지</h1>} />
        <Route path="/community" element={<h1>커뮤니티 페이지</h1>} />
        <Route path="/news" element={<h1>뉴스 페이지</h1>} />
      </Routes>
    </Router>
  );
}

export default App;