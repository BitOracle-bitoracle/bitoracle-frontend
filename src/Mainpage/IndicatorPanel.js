import React, { useEffect, useState } from "react";
import "./IndicatorPanel.css";

const IndicatorPanel = () => {
  const [data, setData] = useState({
    marketCap: null,
    dominance: null,
    fearGreed: "Extreme Greed (78)",
    kimchiPremium: "+3.1%",
  });
  const [flash, setFlash] = useState({
    marketCap: false,
    dominance: false,
    fearGreed: false,
    kimchiPremium: false,
  });

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const [globalRes, fearRes, upbitRes, binanceRes] = await Promise.all([
          fetch("https://api.coingecko.com/api/v3/global"),
          fetch("https://api.alternative.me/fng/?limit=1"),
          fetch("https://api.upbit.com/v1/ticker?markets=USDT-BTC"),
          fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"),
        ]);

        const globalData = await globalRes.json();
        const fearData = await fearRes.json();
        const upbitData = await upbitRes.json();
        const binanceData = await binanceRes.json();

        const usdCap = globalData.data.total_market_cap.usd;
        const btcDom = globalData.data.market_cap_percentage.btc;
        const fearValue = fearData.data[0].value;
        const fearLabel = fearData.data[0].value_classification;

        const upbitPrice = upbitData[0].trade_price;
        const binancePrice = parseFloat(binanceData.price);

        const premium = (((upbitPrice - binancePrice) / binancePrice) * 100).toFixed(2);
        const kimchiPremium = `${premium > 0 ? "+" : ""}${premium}%`;

        setData(prev => ({
          ...prev,
          marketCap: `$${(usdCap / 1e12).toFixed(2)}T`,
          dominance: `${btcDom.toFixed(1)}%`,
          fearGreed: `${fearLabel} (${fearValue})`,
          kimchiPremium,
        }));

        setFlash({ marketCap: true, dominance: true, fearGreed: true, kimchiPremium: true });

        setTimeout(() => {
          setFlash({ marketCap: false, dominance: false, fearGreed: false, kimchiPremium: false });
        }, 300);
      } catch (error) {
        console.error("API fetch error:", error);
      }
    };

    const interval = setInterval(fetchGlobal, 10000); // 10초마다 갱신
    fetchGlobal();

    return () => clearInterval(interval);
  }, []);

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
          <p className={flash[item.title] ? "flash" : ""}>{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default IndicatorPanel;
