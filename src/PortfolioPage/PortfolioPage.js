import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import "./PortfolioPage.css";
import PortfolioSummary from './PortfolioSummary';
import PortfolioChart from './PortfolioChart';

const COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FFC107"];

const PortfolioPage = () => {
  const [editMode, setEditMode] = useState(false);
  // holdings: [{ coin, amount, avgPrice, currentPrice }]
  const [holdings, setHoldings] = useState([]);

  // -------------------------------
  // 1. 페이지 진입 시 포트폴리오 생성
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;
    fetch("https://api.bitoracle.shop/api/portfolio/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch((err) => {
      console.error("❌ 포트폴리오 생성 오류:", err);
    });
  }, []);

   // -------------------------------
   // 2. STOMP 연결: "/ws-portfolio" → 구독 "/user/queue/portfolio"
   // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const socket = new SockJS("https://api.bitoracle.shop/ws-portfolio");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log("✅ STOMP 연결 성공");


        stompClient.subscribe("/user/queue/portfolio", (message) => {
          const data = JSON.parse(message.body);
          console.log("📥 실시간 포트폴리오 데이터:", data);
          // data: [{ coin, amount, avgPrice, currentPrice }]
          if (Array.isArray(data)) {
            // Map incoming data to our holdings shape
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
      { coin: "BTC", amount: 0, avgPrice: 0, currentPrice: 0 }
    ]);
  };

  const removeRow = (index) => {
    const removedItem = holdings[index];
    const updated = holdings.filter((_, i) => i !== index);
    setHoldings(updated);

    const token = localStorage.getItem("access");
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
    fetch("https://api.bitoracle.shop/api/portfolio/sell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("코인 매도 실패");
        return res.json();
      })
      .then(() => {
        console.log("✅ 포트폴리오 항목 삭제 완료");
      })
      .catch((err) => {
        console.error("❌ 삭제 중 오류:", err);
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
        {/* -------------------------------
            4. 편집 완료 시: holdings 배열을 순회하며 각각 buy API 호출
        ------------------------------- */}
        <a
          href="#"
          className="edit-toggle-button"
          onClick={async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("access");
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
                    // avgPrice가 0이거나 null이면 undefined로 보내면 backend에서 현재가로 처리
                    price: item.avgPrice || undefined,
                  };
                  const res = await fetch("https://api.bitoracle.shop/api/portfolio/buy", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  });
                  if (!res.ok) {
                    throw new Error(`매수 API 오류(coin=${item.coin})`);
                  }
                }
                console.log("✅ 포트폴리오 저장(매수) 완료");
                setEditMode(false);
              } catch (err) {
                console.error("❌ 저장 중 오류:", err);
              }
            } else {
             setEditMode(true);
            }
          }}
        >
          {editMode ? "수정 완료" : "수정"}
        </a>
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
                <a
                  href="#"
                  className="edit-toggle-button"
                  onClick={(e) => {
                    e.preventDefault();
                    addNewRow();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    padding: "12px 0"
                  }}
                >
                  +
                </a>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioPage;