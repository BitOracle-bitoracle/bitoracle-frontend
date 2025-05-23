import React, { useState } from "react";
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

  const handleInputChange = (index, field, value) => {
    const updated = [...holdings];
    updated[index][field] = value;
    setHoldings(updated);
  };

  const addNewRow = () => {
    setHoldings([...holdings, { coin: "BTC", amount: 0, avgPrice: 0 }]);
  };

  const removeRow = (index) => {
    const updated = holdings.filter((_, i) => i !== index);
    setHoldings(updated);
  };

  const calculate = (item) => {
    const buy = item.amount * item.avgPrice;
    const now = item.amount * (dummyPrices[item.coin] || 0);
    const profit = now - buy;
    const rate = buy === 0 ? 0 : ((profit / buy) * 100).toFixed(2);
    const chartData = { coin: item.coin, value: now };
    return { buy, now, profit, rate, chartData };
  };

  return (
    <div className="portfolio-page">
      <h2>나의 포트폴리오</h2>
      <div className="portfolio-overview">
        <PortfolioSummary />
        <PortfolioChart holdings={holdings} dummyPrices={dummyPrices} />
      </div>
      <div className="portfolio-controls">
        <a href="#" className="edit-toggle-button" onClick={(e) => {
          e.preventDefault();
          setEditMode(!editMode);
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
                <td className={calc.profit >= 0 ? "profit" : "loss"}>
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