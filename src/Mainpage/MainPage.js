import React from "react";
import IndicatorPanel from "./IndicatorPanel";
import NewsSlider from "./NewsSlider";
import "./MainPage.css";

const MainPage = () => {
  return (
    <>
      <div className="main-scroll-wrapper">
        <div className="main-content">
          <div className="main-container">
            <div className="panel">
              <IndicatorPanel />
            </div>
            <div className="panel">
              <NewsSlider />
            </div>
          </div>
          <div className="section-divider" />
          <div className="bottom-panel">
            <div className="prediction-chart-placeholder">
              <h2>📈 비트코인 가격 예측 차트</h2>
              <p>예측 차트가 이 영역에 표시됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
