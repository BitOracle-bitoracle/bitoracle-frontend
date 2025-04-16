import React, { useState } from "react";
import "./IndicatorPanel.css";

const IndicatorPanel = () => {
  const [data, setData] = useState({
    marketCap: "$1.23T", // 임시 값
    dominance: "49.1%",  // 임시 값
    fearGreed: "Greed (65)", // 임시 값
    kimchiPremium: "+2.5%", // 임시 값
  });

  const indicators = [
    { title: "시가총액", value: data.marketCap || "Loading..." },
    { title: "공포와 탐욕 지수", value: data.fearGreed },
    { title: "비트코인 도미넌스", value: data.dominance || "Loading..." },
    { title: "김치 프리미엄", value: data.kimchiPremium },
  ];

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
