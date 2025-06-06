import React, { useState } from "react";
import IndicatorPanel from "./IndicatorPanel";
import NewsSlider from "./NewsSlider";
import PredictionChart from "./PredictionChart";
import CoinList from "./CoinList";
import { bitcoinHistory } from "../DummyData/bitcoinHistory";
import "./MainPage.css";

const MainPage = () => {
  // 더미 비트코인 히스토리 데이터로 state 초기화
  const [predictionData] = useState(bitcoinHistory);

  return (
    <>
      <div className="main-scroll-wrapper">
        <div className="main-content">
          <div className="main-container">
            <div className="panel">
              <div className="indicator-panel">
                <IndicatorPanel />
              </div>
              <div className="news-slider">
                <NewsSlider />
              </div>
            </div>
          </div>
          <div className="section-divider" />
          <div className="prediction-section">
            <PredictionChart data={predictionData} />
          </div>
          <div className="section-divider" />
          <div className="coin-list-section" id="coin-list-section">
            <CoinList />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
