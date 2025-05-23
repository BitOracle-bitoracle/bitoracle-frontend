import React from "react";
import "./PortfolioSummary.css";

const PortfolioSummary = ({ summary, totalRate }) => {
  return (
    <div className="overview-left">
      <div className="portfolio-summary">
        <div>
          총 보유자산: <span className="value">￦193,601,543</span>
        </div>
        <div>
          총 매수: <span className="value">￦89,544,663</span>
        </div>
        <div>
          총 평가: <span className="value">￦193,601,542</span>
        </div>
        <div>
          총 평가손익: <span className="red value">+￦104,056,880</span>
        </div>
        <div>
          총 평가수익률: <span className="red value">+116.21%</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;