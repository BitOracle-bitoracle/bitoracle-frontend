import React from "react";
import IndicatorPanel from "./IndicatorPanel";import NewsSlider from "./NewsSlider";
import "./MainPage.css";

const MainPage = () => {
  return (
    <div className="main-container">
      <div className="left-panel">
        <IndicatorPanel />
      </div>
      <div className="right-panel">
        <NewsSlider />
      </div>
    </div>
  );
};

export default MainPage;
