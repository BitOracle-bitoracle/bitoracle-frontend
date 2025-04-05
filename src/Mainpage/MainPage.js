import React from "react";
import NewsSlider from "./NewsSlider";
// import IndicatorPanel from "../components/IndicatorPanel"; // 👈 임시로 주석 처리

import "./MainPage.css";

const MainPage = () => {
  return (
    <div className="main-container">
      {/* <div className="indicator-panel">
        <IndicatorPanel />
      </div> */}
      <div className="news-panel">
        <NewsSlider />
      </div>
    </div>
  );
};

export default MainPage;