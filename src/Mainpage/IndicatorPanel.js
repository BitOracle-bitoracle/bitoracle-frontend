import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import "./IndicatorPanel.css";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const formatValue = (title, value) => {
  if (value === null || value === undefined) return "Loading...";

  if (title === "시가총액") {
    const trillion = 1_000_000_000_000;
    const trillionValue = value / trillion;
    return `$${trillionValue.toFixed(2)}T`;
  }

  if (title === "김치 프리미엄" || title === "비트코인 도미넌스") {
    return `${parseFloat(value).toFixed(2)}%`;
  }

  return value;
};

const IndicatorPanel = () => {
  const [data, setData] = useState({
    marketCap: null,
    dominance: null,
    fearGreed: null,
    kimchiPremium: null,
  });

  useEffect(() => {
    // metrics - 시가총액, 도미넌스, 김치프리미엄 포함
    axiosInstance.get("/api/metrics")
      .then(res => {
        console.log("metrics 응답:", res.data); // 여기 확인
        const { marketCap, btcDominance, kimchiPremium } = res.data;
        setData(prev => ({
          ...prev,
          marketCap,
          dominance: btcDominance,
          kimchiPremium,
        }));
      })
      .catch(err => console.error("metrics API 오류:", err));

    // fear-greed 지수
    axiosInstance.get("/api/metrics/fear-greed")
      .then(res => {
        console.log("fear-greed 응답:", res.data); // 여기 확인
        setData(prev => ({
          ...prev,
          fearGreed: res.data.data.value, // 예시 필드명, 백엔드 응답 구조에 따라 수정
        }));
      })
      .catch(err => console.error("fear-greed API 오류:", err));
  }, []);

  const getFearGreedLabel = (value) => {
    const num = Number(value);
    if (num >= 80) return "극도의 탐욕";
    if (num >= 60) return "탐욕";
    if (num >= 40) return "중간";
    if (num >= 20) return "공포";
    return "극도의 공포";
  };

  const getFearGreedColor = (value) => {
    const num = Number(value);
    if (num >= 80) return "#00C49F"; // 초록
    if (num >= 60) return "#A3E635"; // 연두
    if (num >= 40) return "#FACC15"; // 노랑
    if (num >= 20) return "#FB923C"; // 주황
    return "#EF4444"; // 빨강
  };

  const indicators = [
    { title: "시가총액", value: formatValue("시가총액", data.marketCap) },
    { title: "공포와 탐욕 지수", value: formatValue("공포와 탐욕 지수", data.fearGreed) },
    { title: "비트코인 도미넌스", value: formatValue("비트코인 도미넌스", data.dominance) },
    { title: "김치 프리미엄", value: formatValue("김치 프리미엄", data.kimchiPremium) },
  ];

  return (
    <div className="indicator-grid">
      {indicators.map((item, index) => (
        <div key={index} className="indicator-card">
          <h3 className={item.title === "공포와 탐욕 지수" ? "indicator-title fear-greed-title" : "indicator-title"}>
            {item.title}
          </h3>
          {item.title === "공포와 탐욕 지수" && item.value !== "Loading..." ? (
            <div className="fear-greed-chart-wrapper">
              <RadialBarChart
                width={130}
                height={130}
                innerRadius="70%"
                outerRadius="100%"
                data={[{ name: "FearGreed", value: Number(item.value), fill: getFearGreedColor(item.value) }]}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
              <div className="fear-greed-center">
                <p>{item.value}</p>
                <p>{getFearGreedLabel(item.value)}</p>
              </div>
            </div>
          ) : (
            <p>{item.value}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default IndicatorPanel;