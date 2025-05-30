import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import "./PortfolioPage.css";
import PortfolioSummary from './PortfolioSummary';
import PortfolioChart from './PortfolioChart';

const dummyPrices = {
  BTC: 72000000,
  ETH: 3800000,
  XRP: 850,
};

const COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FFC107"];

const PortfolioPage = () => {
  const [editMode, setEditMode] = useState(false);
  const [holdings, setHoldings] = useState([
    { coin: "BTC", amount: 0.1, avgPrice: 56000000 },
  ]);

useEffect(() => {
  const token = localStorage.getItem("access");
  if (!token) return;

  const socket = new SockJS("https://api.bitoracle.shop/ws-upbit");

  const stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: () => {
      console.log("✅ STOMP 연결 성공");

      stompClient.subscribe("/sub/trade", (message) => {
        const data = JSON.parse(message.body);
        console.log("📥 실시간 거래 데이터:", data);
        // 필요 시 setHoldings 또는 다른 상태 업데이트 구현
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
    updated[index][field] = value;
    setHoldings(updated);
  };

  const addNewRow = () => {
    setHoldings([...holdings, { coin: "BTC", amount: 0, avgPrice: 0 }]);
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

    fetch("https://api.bitoracle.shop/api/portfolio/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(removedItem),
    })
      .then((res) => {
        if (!res.ok) throw new Error("포트폴리오 삭제 실패");
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
    const now = item.amount * (dummyPrices[item.coin] || 0);
    const profit = now - buy;
    const rate = buy === 0 ? 0 : ((profit / buy) * 100).toFixed(2);
    const chartData = { coin: item.coin, value: now };
    return { buy, now, profit, rate, chartData };
  };

  // Compute summary before rendering
  const summary = holdings.reduce(
    (acc, item) => {
      const buy = item.amount * item.avgPrice;
      const now = item.amount * (dummyPrices[item.coin] || 0);
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
        <PortfolioChart holdings={holdings} dummyPrices={dummyPrices} />
      </div>
      <div className="portfolio-controls">
        <a href="#" className="edit-toggle-button" onClick={async (e) => {
          e.preventDefault();
          if (editMode) {
            // 수정 완료 → 서버에 저장
            const token = localStorage.getItem("access");
            if (!token) {
              alert("로그인이 필요합니다.");
              return;
            }
            fetch("https://api.bitoracle.shop/api/portfolio/buy", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(holdings),
            })
              .then((res) => {
                if (!res.ok) throw new Error("포트폴리오 저장 실패");
                return res.json();
              })
              .then(() => {
                console.log("✅ 포트폴리오 저장 완료");
                setEditMode(false);
              })
              .catch((err) => {
                console.error("❌ 저장 중 오류:", err);
              });
          } else {
            setEditMode(true);
          }
        }}>
          {editMode ? "수정 완료" : "수정"}
        </a>
        {/* "+" moved to inside table */}
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