import React, { useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import MainPage from "./Mainpage/MainPage";
import "./App.css";

function App() {
  useEffect(() => {
    const fetchAccessToken = async () => {
      const url = "https://api.bitoracle.shop/api/auth/init";
      console.log("✅ 요청 URL:", url);

      try {
        const res = await axios.get(url, {
          withCredentials: true, // refresh 쿠키 포함
        });

        console.log("✅ 응답 데이터:", res.data);

        if (res.data.accessToken) {
          localStorage.setItem("access", res.data.accessToken);
          console.log("✅ access 토큰 저장 완료:", res.data.accessToken);
        } else {
          console.warn("⚠️ access 토큰 없음!");
        }
      } catch (err) {
        console.error("❌ /api/auth/init 요청 실패:", err);
      }
    };

    fetchAccessToken();
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