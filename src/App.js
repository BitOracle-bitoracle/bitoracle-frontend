import React, { useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import MainPage from "./Mainpage/MainPage";
import News from "./NewsPage/News";
import "./App.css";

function App() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            setIsLoggedIn(true);
            return; // Already logged in, skip token fetch
        }

        const fetchAccessToken = async () => {
            const url = "https://api.bitoracle.shop/api/auth/init";
            console.log("✅ 요청 URL:", url);

            try {
                const res = await axios.get(url, {
                    withCredentials: true, // refresh 쿠키 포함
                });

                console.log("✅ 응답 데이터:", res.data);

                if (res.data.access) {
                    localStorage.setItem("access", res.data.access);
                    setIsLoggedIn(true);
                    console.log("✅ access 토큰 저장 완료:", res.data.access);
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
            <Header>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/cryptos" element={<h1>암호화폐 페이지</h1>} />
                    <Route path="/news" element={<News />} />
                </Routes>
            </Header>
        </Router>
    );
}

export default App;
