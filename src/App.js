import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import MainPage from "./Mainpage/MainPage";
import "./App.css"

function App() {
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