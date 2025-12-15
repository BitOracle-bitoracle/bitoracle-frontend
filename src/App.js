import React, { useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer"
import MainPage from "./Mainpage/MainPage";
import Community from "./CommunityPage/Community";
import Portifolio from "./PortfolioPage/PortfolioPage"
import Post from "./CommunityPage/Post";
import PostWrite from "./CommunityPage/PostWrite";
import News from "./NewsPage/News";
import Proto from "./ProtoPage/Proto";
import "./App.css";

import Layout from "./Layout";
import ScrollToTop from "./ScrollToTop";

function App() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            setIsLoggedIn(true);
            return; // Already logged in, skip token fetch
        }

        const fetchAccessToken = async () => {
            const url = "http://3.36.74.196:8080/api/auth/init";
            console.log("✅ 요청 URL:", url);
        };
    });

  return (
    <Router>
      <ScrollToTop />
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
        <Footer />
      </Layout>
    </Router>
  );
}

export default App;