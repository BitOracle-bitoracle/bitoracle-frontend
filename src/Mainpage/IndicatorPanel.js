import { Stomp } from "@stomp/stompjs";
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

  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // metrics - 시가총액, 도미넌스, 김치프리미엄 포함
    axiosInstance.get("/api/metrics")
      .then(res => {
        const { marketCap, btcDominance, kimchiPremium } = res.data;
        setData(prev => ({
          ...prev,
          marketCap,
          dominance: btcDominance,
          kimchiPremium,
        }));
        setLastUpdate(new Date());
      })
      .catch(err => console.error("metrics API 오류:", err));

    // fear-greed 지수
    axiosInstance.get("/api/metrics/fear-greed")
      .then(res => {
        setData(prev => ({
          ...prev,
          fearGreed: res.data.data.value, // 예시 필드명, 백엔드 응답 구조에 따라 수정
        }));
        setLastUpdate(new Date());
      })
      .catch(err => console.error("fear-greed API 오류:", err));

    // STOMP over WebSocket
    const ws = new WebSocket("wss://api.bitoracle.shop/ws-metrics");
    const client = Stomp.over(ws);

    client.connect({}, (frame) => {
      // console.log("STOMP 연결 성공:", frame);
      client.subscribe("/sub/metrics", (message) => {
        // console.log("STOMP 메시지 수신:", message);
        try {
          const payload = JSON.parse(message.body);
          setData(prev => ({ ...prev, ...payload }));
          setLastUpdate(new Date());
        } catch (err) {
          console.error("메시지 JSON 파싱 오류:", err);
        }
      });
    }, (err) => {
      console.error("STOMP 연결 오류:", err);
    });

    return () => {
      client.disconnect();
    };
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
    <>
      {lastUpdate && (
        <p className="last-update">
          마지막 업데이트: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
      <div className="indicator-grid">
        {indicators.map((item, index) => (
          <div key={index} className="indicator-card">
            <h2 className={item.title === "공포와 탐욕 지수" ? "indicator-title fear-greed-title" : "indicator-title"}>
              {item.title}
            </h2>
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
    </>
  );
};

export default IndicatorPanel;