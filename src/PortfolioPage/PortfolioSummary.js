import React from "react";
import "./PortfolioSummary.css";

const PortfolioSummary = ({ summary }) => {
  const { totalBuy, totalNow, totalProfit, totalRate } = summary;
  return (
    <div className="overview-left">
      <div className="portfolio-summary">
        {/* 총 보유자산 (메인) */}
        <div className="summary-main">
          <span className="summary-main-label">총 보유자산</span>
          <span className="summary-main-value">₩{totalNow.toLocaleString()}</span>
        </div>
        
        {/* 상세 정보 그리드 */}
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">총 매수</span>
            <span className="value">₩{totalBuy.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="label">평가손익</span>
            <span className={`value ${totalProfit >= 0 ? 'red' : 'blue'}`}>
              {totalProfit >= 0 ? '+' : ''}₩{totalProfit.toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">총 평가</span>
            <span className="value">₩{totalNow.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="label">수익률</span>
            <span className={`value ${totalProfit >= 0 ? 'red' : 'blue'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalRate.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioSummary;