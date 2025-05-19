import React, { useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import MainPage from "./Mainpage/MainPage";
import Community from "./CommunityPage/Community";
import Portifolio from "./PortfolioPage/PortfolioPage"
import Post from "./CommunityPage/Post";
import PostWrite from "./CommunityPage/PostWrite";
import News from "./NewsPage/News";
import Proto from "./ProtoPage/Proto";
import "./App.css";

import Layout from "./Layout";

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
        };
    });

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/cryptos" element={<h1>암호화폐 페이지</h1>} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/write" element={<PostWrite />} />
          <Route path="/community/post/:id" element={<Post />} />
          <Route path="/news" element={<News />} />
          <Route path="/proto" element={<Proto />} />
          <Route path="/portfolio" element={<Portifolio />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;