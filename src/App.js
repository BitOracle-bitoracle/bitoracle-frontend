import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import MainPage from "./Mainpage/MainPage";
import "./App.css";
import axios from "axios";

function App() {
  useEffect(() => {
    axios.get("https://api.bitoracle.shop/token", {
      withCredentials: true,
    })
    .then((res) => {
      const accessToken = res.data.access;
      if (accessToken) {
        localStorage.setItem("access", accessToken);
        console.log("🔓 access 토큰 저장됨:", accessToken);
      }
    })
    .catch((err) => {
      console.error("❌ access 토큰 요청 실패:", err);
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