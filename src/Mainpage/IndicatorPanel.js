import React from "react";
import "./IndicatorPanel.css";

const indicators = [
  { title: "시가총액", value: "$1.23T" },
  { title: "공포와 탐욕 지수", value: "Extreme Greed (78)" },
  { title: "비트코인 도미넌스", value: "52.4%" },
  { title: "김치 프리미엄", value: "+3.1%" },
];

const IndicatorPanel = () => {
  return (
    <div className="indicator-grid">
      {indicators.map((item, index) => (
        <div key={index} className="indicator-card">
          <h3>{item.title}</h3>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default IndicatorPanel;
