import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./PortfolioPage.css";
import PortfolioSummary from './PortfolioSummary';
import PortfolioChart from './PortfolioChart';

const PortfolioPage = () => {
  const [editMode, setEditMode] = useState(false);
  const editModeRef = useRef(editMode);
  useEffect(() => {
    editModeRef.current = editMode;
  }, [editMode]);
  // holdings: [{ coin, amount, avgPrice, currentPrice }]
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  // 더미 데이터 (로컬 환경용)
  const dummyHoldings = [
    { coin: "BTC", amount: 0.5, avgPrice: 95000000, currentPrice: 98500000 },
    { coin: "ETH", amount: 2.0, avgPrice: 48000000, currentPrice: 48500000 },
    { coin: "XRP", amount: 10000, avgPrice: 1200, currentPrice: 1250 }
  ];
  
  const [holdings, setHoldings] = useState(isLocalhost ? dummyHoldings : []);
  const [originalHoldings, setOriginalHoldings] = useState([]);


   // -------------------------------
   // 2. STOMP 연결: "/ws-portfolio" → 구독 "/user/queue/portfolio"
   // -------------------------------
  useEffect(() => {
    // 로컬 환경에서는 STOMP 연결 스킵
    if (isLocalhost) {
      console.log("✅ 로컬 테스트 - STOMP 연결 스킵");
      return;
    }
    
    const token = localStorage.getItem("access");
    console.log("PortfolioPage - STOMP token:", token); //디버깅
    if (!token) return;

    // STOMP connection via SockJS, WebSocket transport only
    const socket = new SockJS(
      `https://api.bitoracle.shop/ws-portfolio?token=Bearer ${token}`,
      null,
      {
        transports: ["websocket"], // disable JSONP/polling fallback
        withCredentials: true,     // send cookies for refresh token
      }
    );
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("PortfolioPage - STOMP connected, subscribing...");
        stompClient.subscribe("/user/queue/portfolio", (message) => {
          const data = JSON.parse(message.body);
          console.log("PortfolioPage - STOMP message data:", data);
          // 데이터가 빈 배열([])인 경우에는 기존 holdings 유지
          // editMode일 때는 holdings를 덮어쓰지 않음
          if (
            !editModeRef.current &&
            Array.isArray(data) &&
            data.length > 0
          ) {
            setHoldings(
              data.map((item) => ({
                coin: item.coinName.replace("KRW-", ""),
                amount: item.quantity,
                avgPrice: item.averageBuyPrice,
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

    // 로컬 환경에서는 API 호출 없이 바로 삭제
    if (isLocalhost) {
      console.log("✅ 로컬 테스트 - 코인 삭제:", removedItem.coin);
      return;
    }

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
      ...(removedItem.avgPrice && !isNaN(removedItem.avgPrice) && removedItem.avgPrice > 0 && { price: removedItem.avgPrice }),
    };
    console.log("PortfolioPage - removeRow payload:", payload); //디버깅
    fetch("https://api.bitoracle.shop/api/portfolio/sell", {
      method: "POST",
      // credentials: "include",                // 쿠키 전송
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
      <div className="portfolio-content">
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
            if (editMode) {
              const duplicateCoins = holdings.map(h => h.coin).filter((v, i, a) => a.indexOf(v) !== i);
              if (duplicateCoins.length > 0) {
                alert("동일한 코인을 여러 개 추가할 수 없습니다.");
                return;
              }

              // 로컬 환경에서는 API 호출 없이 바로 적용
              if (isLocalhost) {
                console.log("✅ 로컬 테스트 - 포트폴리오 수정 완료:", holdings);
                setEditMode(false);
                editModeRef.current = false;
                return;
              }

              const token = localStorage.getItem("access");
              console.log("PortfolioPage - BUY loop token:", token); //디버깅
              if (!token) {
                alert("로그인이 필요합니다.");
                return;
              }

              // 수정 완료 모드 → 각 항목별 매수 API 호출
              try {
                for (const item of holdings) {
                  // First, sell the previous amount (assuming it's stored in originalHoldings)
                  const previous = originalHoldings.find(h => h.coin === item.coin);
                  if (previous) {
                    const sellPayload = {
                      coinName: `KRW-${item.coin}`,
                      quantity: previous.amount,
                      ...(previous.avgPrice && !isNaN(previous.avgPrice) && previous.avgPrice > 0 && { price: previous.avgPrice }),
                    };
                    await fetch("https://api.bitoracle.shop/api/portfolio/sell", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(sellPayload),
                    });
                  }

                  // Then, buy the updated amount
                  const buyPayload = {
                    coinName: `KRW-${item.coin}`,
                    quantity: item.amount,
                    ...(item.avgPrice && !isNaN(item.avgPrice) && item.avgPrice > 0 && { price: item.avgPrice }),
                  };
                  console.log("PortfolioPage - BUY payload:", buyPayload); //디버깅
                  const res = await fetch("https://api.bitoracle.shop/api/portfolio/buy", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(buyPayload),
                  });
                  console.log(`PortfolioPage - BUY response for ${item.coin}:`, res.status); //디버깅
                  if (!res.ok) {
                    throw new Error(`매수 API 오류(coin=${item.coin})`);
                  }
                }
                console.log("✅ 포트폴리오 저장(매수) 완료");
                setEditMode(false);
                setTimeout(() => {
                  editModeRef.current = false;
                }, 1500);
              } catch (err) {
                console.error("PortfolioPage - BUY error:", err);
              }
            } else {
              setOriginalHoldings(holdings.map(h => ({ ...h })));
              setEditMode(true);
            }
          }}
        >
          {editMode ? "수정 완료" : "수정"}
        </button>
      </div>
      {/* 모바일 카드 뷰 (업비트 스타일) */}
      <div className="mobile-coin-cards">
        {holdings.map((item, i) => {
          const calc = calculate(item);
          return (
            <div key={i} className="coin-card">
              <div className={`coin-card-header ${editMode ? 'edit-mode' : ''}`}>
                <div className="coin-name">
                  {editMode ? (
                    <select
                      value={item.coin}
                      onChange={(e) => handleInputChange(i, "coin", e.target.value)}
                      className="coin-select"
                    >
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="XRP">XRP</option>
                    </select>
                  ) : (
                    <div className="coin-info">
                      <img 
                        src={`/icons/${item.coin.toLowerCase()}.png`} 
                        alt={item.coin}
                        className="coin-icon"
                      />
                      <span className="coin-symbol">{item.coin}</span>
                    </div>
                  )}
                </div>
                <div className="coin-profit-info">
                  <div className="profit-row">
                    <span className="label">평가손익</span>
                    <span className={`value ${calc.profit >= 0 ? 'red' : 'blue'}`}>
                      {calc.profit >= 0 ? '+' : ''}₩{calc.profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="profit-row">
                    <span className="label">수익률</span>
                    <span className={`value ${calc.profit >= 0 ? 'red' : 'blue'}`}>
                      {calc.rate >= 0 ? '+' : ''}{calc.rate}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="coin-card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-value">
                      {editMode ? (
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleInputChange(i, "amount", parseFloat(e.target.value))}
                        />
                      ) : (
                        item.amount.toLocaleString()
                      )} {item.coin}
                    </span>
                    <span className="info-label">보유수량</span>
                  </div>
                  <div className="info-item">
                    <span className="info-value">
                      {editMode ? (
                        <input
                          type="number"
                          value={item.avgPrice}
                          onChange={(e) => handleInputChange(i, "avgPrice", parseFloat(e.target.value))}
                        />
                      ) : (
                        `₩${item.avgPrice.toLocaleString()}`
                      )}
                    </span>
                    <span className="info-label">매수평균가</span>
                  </div>
                  <div className="info-item">
                    <span className="info-value">₩{calc.now.toLocaleString()}</span>
                    <span className="info-label">평가금액</span>
                  </div>
                  <div className="info-item">
                    <span className="info-value">₩{calc.buy.toLocaleString()}</span>
                    <span className="info-label">매수금액</span>
                  </div>
                </div>
              </div>
              {editMode && (
                <button className="delete-btn" onClick={() => removeRow(i)}>
                  삭제
                </button>
              )}
            </div>
          );
        })}
        {editMode && (
          <button className="add-coin-btn" onClick={() => addNewRow()}>
            + 코인 추가
          </button>
        )}
      </div>

      {/* 데스크톱 테이블 뷰 */}
      <div className="desktop-table-wrapper">
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
                <td>₩{calc.buy.toLocaleString()}</td>
                <td>₩{calc.now.toLocaleString()}</td>
                <td className={calc.profit >= 0 ? "red" : "blue"}>
                  {calc.rate >= 0 ? '+' : ''}{calc.rate}%<br />₩{calc.profit.toLocaleString()}
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
      </div>
    </div>
  );
};

export default PortfolioPage;