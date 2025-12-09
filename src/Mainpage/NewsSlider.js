import React, { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import "./NewsSlider.css";

const NewsSlider = () => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const [newsData, setNewsData] = useState([]);
  const [current, setCurrent] = useState(1);
  const [transition, setTransition] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const sliderRef = useRef(null);

  useEffect(() => {
    if (isLocalhost) {
      const dummyNews = [
        {
          news_type: "GOOD",
          news_title: "비트코인, 기관 투자자들의 대규모 매수세 지속",
          news_content:
            "주요 기관 투자자들이 비트코인에 대한 투자를 확대하며 시장에 긍정적인 신호를 보이고 있습니다.",
          image_url: "/news1.jpeg",
        },
        {
          news_type: "BAD",
          news_title: "암호화폐 규제 강화 움직임, 시장 불안감 증가",
          news_content:
            "일부 국가에서 암호화폐 거래에 대한 규제가 강화되면서 시장의 불안감이 커지고 있습니다.",
          image_url: "/news2.jpg",
        },
        {
          news_type: "GOOD",
          news_title: "이더리움 2.0 업그레이드 성공",
          news_content:
            "이더리움의 최신 업그레이드가 성공적으로 완료되어 거래 속도와 효율성이 크게 개선되었습니다.",
          image_url: "/news3.jpg",
        },
      ];
      setNewsData(dummyNews);
      return;
    }

    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get("/api/news/main");
        setNewsData(response.data.data);
      } catch (error) {
        console.error("뉴스 가져오기 실패", error);
      }
    };

    fetchNews();
  }, [isLocalhost]);

  const totalSlides = newsData.length;
  const extendedSlides =
    totalSlides > 0
      ? [newsData[totalSlides - 1], ...newsData, newsData[0]]
      : [];

  const moveSlide = useCallback((direction) => {
    if (isAnimating) return;
    if (totalSlides <= 1) return;

    setIsAnimating(true);
    setTransition(true);

    if (direction === "next") {
      setCurrent((prev) => prev + 1);
    } else {
      setCurrent((prev) => prev - 1);
    }
  }, [isAnimating, totalSlides]);

  // ★ 중요: setInterval(자동 타이머) 제거됨!
  // 대신 아래 JSX의 onAnimationEnd에서 자동 넘김을 처리합니다.

  const handleTransitionEnd = () => {
    setIsAnimating(false);
    if (current === totalSlides + 1) {
      setTransition(false);
      setCurrent(1);
    } else if (current === 0) {
      setTransition(false);
      setCurrent(totalSlides);
    }
  };

  const handleDotClick = (index) => {
    if (isAnimating) return;
    if (current === index + 1) return;

    setIsAnimating(true);
    setTransition(true);
    setCurrent(index + 1);
  };

  if (newsData.length === 0) return null;

  return (
    <div className="news-slider">
      <div
        className="news-slider-track"
        ref={sliderRef}
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: transition ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
        }}
      >
        {extendedSlides.map((news, idx) => (
          <div
            key={idx}
            className="news-slide"
            style={{
              backgroundImage:
                news.image_url && typeof news.image_url === "string"
                  ? `url(${news.image_url})`
                  : `url(/BitOracle_Logo_News.png)`,
            }}
          >
            <div className="text-overlay">
              <div className="news-badge-wrapper">
                {news.news_type === "GOOD" ? (
                  <span className="news-badge good">호재</span>
                ) : (
                  <span className="news-badge bad">악재</span>
                )}
              </div>
              <h2 className="news-title">{news.news_title}</h2>
              <p className="news-desc">{news.news_content}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="nav-btn prev" onClick={() => moveSlide("prev")}>❮</button>
      <button className="nav-btn next" onClick={() => moveSlide("next")}>❯</button>

      <div className="pagination-dots">
        {newsData.map((_, idx) => {
          let realIndex = current - 1;
          if (current === 0) realIndex = totalSlides - 1;
          if (current === totalSlides + 1) realIndex = 0;

          const isActive = realIndex === idx;

          return (
            <span
              key={idx}
              className={`dot ${isActive ? "active" : ""}`}
              onClick={() => handleDotClick(idx)}
              // ★ 핵심: CSS 애니메이션이 끝나는 순간(바가 다 찼을 때) 다음 슬라이드 호출
              onAnimationEnd={() => isActive && moveSlide("next")}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NewsSlider;