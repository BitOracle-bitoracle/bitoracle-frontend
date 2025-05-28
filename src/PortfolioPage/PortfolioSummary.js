import React from "react";
import "./PortfolioSummary.css";

const PortfolioSummary = ({ summary }) => {
  const { totalBuy, totalNow, totalProfit, totalRate } = summary;
  return (
    <div className="overview-left">
      <div className="portfolio-summary">
        <div>
          총 보유자산: <span className="value">{totalNow.toLocaleString()}￦</span>
        </div>
        <div>
          총 매수: <span className="value">{totalBuy.toLocaleString()}￦</span>
        </div>
        <div>
          총 평가: <span className="value">{totalNow.toLocaleString()}￦</span>
        </div>
        <div>
          총 평가손익: <span className={`value ${totalProfit >= 0 ? 'red' : 'blue'}`}>
            {totalProfit >= 0 ? '+' : '-'}{Math.abs(totalProfit).toLocaleString()}￦
          </span>
        </div>
        <div>
          총 평가수익률: <span className={`value ${totalProfit >= 0 ? 'red' : 'blue'}`}>
            {totalProfit >= 0 ? '+' : '-'}{Math.abs(totalRate).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default PortfolioSummary;