import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import "./NewsSlider.css";

const mockNews = [
  {
    title: "비트코인 가격 급등, 기관 투자자 유입 가속화",
    summary: "최근 비트코인 가격이 10% 이상 상승하며 기관 자금의 유입이 확인되고 있습니다.",
    image: "/news1.jpeg",
  },
  {
    title: "미국 SEC, 이더리움 ETF 승인 여부 다음 주 발표 예정",
    summary: "이더리움 현물 ETF에 대한 규제기관의 판단이 시장에 큰 영향을 줄 것으로 보입니다.",
    image: "/news2.jpg",
  },
  {
    title: "김치프리미엄 확대, 국내 투자 심리 과열 주의",
    summary: "한국 암호화폐 시장에서 김치프리미엄이 다시 상승세를 보이고 있어 주의가 요구됩니다.",
    image: "/news3.jpg",
  },
];

const NewsSlider = () => {
  const [current, setCurrent] = useState(1); // 처음 시작은 index 1 (첫 번째 실제 슬라이드)
  const [transition, setTransition] = useState(true);
  const totalSlides = mockNews.length;
  const sliderRef = useRef(null);

  const extendedSlides = [
    mockNews[totalSlides - 1], // 마지막 → 앞에 복제
    ...mockNews,
    mockNews[0],               // 첫 번째 → 뒤에 복제
  ];

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
            style={{ backgroundImage: `url(${news.image})` }}
          >
            <div className="overlay">
              <h2>{news.title}</h2>
              <p>{news.summary}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="slider-controls">
        <button onClick={() => setCurrent((prev) => prev - 1)}>〈</button>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", margin: "0 16px" }}>
          {mockNews.map((_, idx) => {
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