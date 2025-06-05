import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import "./PortfolioPage.css";
import PortfolioSummary from './PortfolioSummary';
import PortfolioChart from './PortfolioChart';

const PortfolioPage = () => {
  const [editMode, setEditMode] = useState(false);
  // holdings: [{ coin, amount, avgPrice, currentPrice }]
  const [holdings, setHoldings] = useState([]);


   // -------------------------------
   // 2. STOMP 연결: "/ws-portfolio" → 구독 "/user/queue/portfolio"
   // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access");
    console.log("PortfolioPage - STOMP token:", token); //디버깅
    if (!token) return;

    // STOMP connection via WebSocket only, no SockJS/JSONP fallback
    const stompClient = new Client({
      brokerURL: `wss://api.bitoracle.shop/ws-portfolio/websocket?token=Bearer ${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("PortfolioPage - STOMP connected, subscribing...");
        stompClient.subscribe("/user/queue/portfolio", (message) => {
          const data = JSON.parse(message.body);
          console.log("PortfolioPage - STOMP message data:", data);
          if (Array.isArray(data)) {
            setHoldings(
              data.map((item) => ({
                coin: item.coin,
                amount: item.amount,
                avgPrice: item.avgPrice,
                currentPrice: item.currentPrice,
              }))
            );
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);
  const handleInputChange = (index, field, value) => {
    const updated = [...holdings];
    updated[index] = { ...updated[index], [field]: value };
    setHoldings(updated);
  };

  const addNewRow = () => {
    setHoldings([
      ...holdings,
      { coin: "BTC", amount: 0, avgPrice: 0, currentPrice: 0 },
    ]);
  };

  const removeRow = (index) => {
    console.log("PortfolioPage - removeRow index:", index); //디버깅
    const removedItem = holdings[index];
    const updated = holdings.filter((_, i) => i !== index);
    setHoldings(updated);

    const token = localStorage.getItem("access");
    console.log("PortfolioPage - removeRow token:", token); //디버깅
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // -------------------------------
    // 3. 코인 삭제: DELETE 대신 POST "/api/portfolio/sell" (backend spec)
    // -------------------------------
    // 백엔드가 기대하는 필드명: coinName, quantity, price
    const payload = {
      coinName: `KRW-${removedItem.coin}`,
      quantity: removedItem.amount,
      price: removedItem.avgPrice || undefined,
    };
    console.log("PortfolioPage - removeRow payload:", payload); //디버깅
    fetch("https://api.bitoracle.shop/api/portfolio/sell", {
      method: "POST",
      credentials: "include",                // 쿠키 전송
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log("PortfolioPage - SELL response status:", res.status); //디버깅
        if (!res.ok) throw new Error("코인 매도 실패");
        return res.json();
      })
      .then(() => {
        console.log("✅ 포트폴리오 항목 삭제 완료");
      })
      .catch((err) => {
        console.error("PortfolioPage - SELL error:", err);
      });
  };

  const calculate = (item) => {
    const buy = item.amount * item.avgPrice;
    const now = item.amount * (item.currentPrice || 0);
    const profit = now - buy;
    const rate = buy === 0 ? 0 : ((profit / buy) * 100).toFixed(2);
    const chartData = { coin: item.coin, value: now };
    return { buy, now, profit, rate, chartData };
  };

  // Compute summary before rendering
  const summary = holdings.reduce(
    (acc, item) => {
      const buy = item.amount * item.avgPrice;
      const now = item.amount * (item.currentPrice || 0);
      const profit = now - buy;
      acc.totalBuy += buy;
      acc.totalNow += now;
      acc.totalProfit += profit;
      return acc;
    },
    { totalBuy: 0, totalNow: 0, totalProfit: 0 }
  );
  summary.totalRate = summary.totalBuy === 0 ? 0 : (summary.totalProfit / summary.totalBuy) * 100;

  return (
    <div className="portfolio-page">
      <h2>나의 포트폴리오</h2>
       <div className="portfolio-overview">
         <PortfolioSummary summary={summary} />
         <PortfolioChart holdings={holdings} />
       </div>
       <div className="portfolio-controls">
        {/* 편집 완료 시: holdings 배열을 순회하며 각각 buy API 호출 */}
        <button
          type="button"
          className="edit-toggle-button"
          onClick={async () => {
            const token = localStorage.getItem("access");
            console.log("PortfolioPage - BUY loop token:", token); //디버깅
            if (!token) {
              alert("로그인이 필요합니다.");
              return;
            }

            if (editMode) {
              // 수정 완료 모드 → 각 항목별 매수 API 호출
              try {
                for (const item of holdings) {
                  const payload = {
                    coinName: `KRW-${item.coin}`,
                    quantity: item.amount,
                    price: item.avgPrice || undefined,
                  };
                  console.log("PortfolioPage - BUY payload:", payload); //디버깅
                  const res = await fetch("https://api.bitoracle.shop/api/portfolio/buy", {
                    method: "POST",
                    credentials: "include",    // 쿠키 전송
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  });
                  console.log(`PortfolioPage - BUY response for ${item.coin}:`, res.status); //디버깅
                  if (!res.ok) {
                    throw new Error(`매수 API 오류(coin=${item.coin})`);
                  }
                }
                console.log("✅ 포트폴리오 저장(매수) 완료");
                setEditMode(false);
              } catch (err) {
                console.error("PortfolioPage - BUY error:", err);
              }
            } else {
              setEditMode(true);
            }
          }}
        >
          {editMode ? "수정 완료" : "수정"}
        </button>
      </div>
      <table className="portfolio-table">
        <thead>
          <tr>
            <th>보유자산</th>
            <th>보유수량</th>
            <th>매수평균가</th>
            <th>매수금액</th>
            <th>평가금액</th>
            <th>평가손익</th>
            {editMode && <th>삭제</th>}
          </tr>
        </thead>
        <tbody>
          {holdings.map((item, i) => {
            const calc = calculate(item);
            return (
              <tr key={i}>
                <td>
                  {editMode ? (
                    <select
                      value={item.coin}
                      onChange={(e) =>
                        handleInputChange(i, "coin", e.target.value)
                      }
                      className="coin-select"
                    >
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="XRP">XRP</option>
                    </select>
                  ) : (
                    item.coin
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      handleInputChange(i, "amount", parseFloat(e.target.value))
                    }
                    disabled={!editMode}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.avgPrice}
                    onChange={(e) =>
                      handleInputChange(i, "avgPrice", parseFloat(e.target.value))
                    }
                    disabled={!editMode}
                  />
                </td>
                <td>{calc.buy.toLocaleString()}￦</td>
                <td>{calc.now.toLocaleString()}￦</td>
                <td className={calc.profit >= 0 ? "red" : "blue"}>
                  {calc.rate}%<br />{calc.profit.toLocaleString()}￦
                </td>
                {editMode && (
                  <td>
                    <button
                      type="button"
                      className="edit-toggle-button"
                      onClick={() => removeRow(i)}
                    >
                      삭제
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
          {editMode && (
            <tr>
              <td colSpan="7">
                <button
                  type="button"
                  className="edit-toggle-button"
                  onClick={() => addNewRow()}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    padding: "12px 0",
                  }}
                >
                  +
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioPage;