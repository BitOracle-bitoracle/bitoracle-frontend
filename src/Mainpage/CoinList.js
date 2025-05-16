import React from 'react';
import './CoinList.css';

const CoinList = () => {
  const coins = [
    { rank: 1, name: '비트코인', symbol: 'BTC', price: '₩144,723,609.41', change1h: -0.11, change24h: 1.01, change7d: 0.57, marketCap: '₩2,700조' },
    { rank: 2, name: '이더리움', symbol: 'ETH', price: '₩3,595,635.92', change1h: 0.10, change24h: -0.19, change7d: 15.74, marketCap: '₩500조' },
    { rank: 3, name: '리플',    symbol: 'XRP', price: '₩3,367.18',    change1h: 0.05, change24h: -4.09, change7d: 4.66, marketCap: '₩150조' },
  ];

  return (
    <div className="coin-list-container">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 'bold' }}>
        코인 리스트
      </h2>
      <table className="coin-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>이름</th>
            <th>가격</th>
            <th>시가총액</th>
            <th>1시간 %</th>
            <th>24시간 %</th>
            <th>7일 %</th>
          </tr>
        </thead>
        <tbody>
          {coins.map(c => (
            <tr key={c.rank} className="coin-cell">
              <td>{c.rank}</td>
              <td className="coin-cell">
                <img
                  src={`/icons/${c.symbol.toLowerCase()}.png`}
                  alt=""
                  className="coin-icon"
                />
                <span className="coin-name">{c.name}</span>
                <span className="symbol">{c.symbol}</span>
              </td>
              <td>{c.price}</td>
              <td>{c.marketCap}</td>
              <td className={c.change1h >= 0 ? 'positive' : 'negative'}>
                {c.change1h >= 0 ? `▲ ${c.change1h}%` : `▼ ${Math.abs(c.change1h)}%`}
              </td>
              <td className={c.change24h >= 0 ? 'positive' : 'negative'}>
                {c.change24h >= 0 ? `▲ ${c.change24h}%` : `▼ ${Math.abs(c.change24h)}%`}
              </td>
              <td className={c.change7d >= 0 ? 'positive' : 'negative'}>
                {c.change7d >= 0 ? `▲ ${c.change7d}%` : `▼ ${Math.abs(c.change7d)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinList;