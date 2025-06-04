import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import "./NewsSlider.css";

const NewsSlider = () => {
  const [newsData, setNewsData] = useState([]);
  const [current, setCurrent] = useState(1); // 처음 시작은 index 1 (첫 번째 실제 슬라이드)
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get("/api/news/main");
        console.log("📥 뉴스 API 응답 전체:", response.data);      // ← 여기 추가
        setNewsData(response.data.data);
      } catch (error) {
        console.error("뉴스 가져오기 실패", error);
      }
    };

    fetchNews();
  }, []);

  const totalSlides = newsData.length;
  const extendedSlides = totalSlides > 0 ? [
    newsData[totalSlides - 1], // 마지막 → 앞에 복제
    ...newsData,
    newsData[0],               // 첫 번째 → 뒤에 복제
  ] : [];

  const sliderRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (current === totalSlides + 1) {
      const timer = setTimeout(() => {
        setTransition(false);
        setCurrent(1);
      }, 600);
      return () => clearTimeout(timer);
    } else if (current === 0) {
      const timer = setTimeout(() => {
        setTransition(false);
        setCurrent(totalSlides);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setTransition(true);
    }
  }, [current, totalSlides]);

  useLayoutEffect(() => {
    if (!transition && (current === 1 || current === totalSlides)) {
      const slider = sliderRef.current;
      if (slider) {
        // force reflow
        void slider.offsetHeight;
      }
      setTransition(true);
    }
  }, [transition, current, totalSlides]);

  return (
    <div className="news-slider">
      <div
        className="news-slider-inner"
        ref={sliderRef}
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: transition ? "transform 0.6s ease-in-out" : "none",
        }}
      >
        {extendedSlides.map((news, idx) => (
          <div
            key={idx}
            className="news-slide"
            style={{ backgroundImage: `url(${news.image_url || "/BitOracle_Logo_News.png"})` }}
          >
            <div className="overlay">
              <h2>{news.news_title}</h2>
              <p>{news.news_content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="slider-controls">
        <button onClick={() => setCurrent((prev) => prev - 1)}>〈</button>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", margin: "0 16px" }}>
          {newsData.map((_, idx) => {
            const realIndex = current === 0 ? totalSlides - 1 : current === totalSlides + 1 ? 0 : current - 1;
            return (
              <span
                key={idx}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: realIndex === idx ? "white" : "gray",
                  display: "inline-block"
                }}
              />
            );
          })}
        </div>
        <button onClick={() => setCurrent((prev) => prev + 1)}>〉</button>
      </div>
    </div>
  );
};

export default NewsSlider;