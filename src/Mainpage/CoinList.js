import React from 'react';
import './CoinList.css';

const CoinList = () => {
  const coins = [
    {
      rank: 1,
      name: '비트코인',
      symbol: 'BTC',
      price: '₩144,723,609.41',
      marketCap: '₩2,900조',
      volume24h: '₩50조',
      change24h: 1.01
    },
    {
      rank: 2,
      name: '이더리움',
      symbol: 'ETH',
      price: '₩3,595,635.92',
      marketCap: '₩440조',
      volume24h: '₩15조',
      change24h: -0.19
    },
    {
      rank: 3,
      name: '리플',
      symbol: 'XRP',
      price: '₩3,367.18',
      marketCap: '₩180조',
      volume24h: '₩5조',
      change24h: -4.09
    },
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
            <th>24시간 거래량</th>
            <th>24시간 변화량</th>
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
              <td>{c.volume24h}</td>
              <td className={c.change24h >= 0 ? 'positive' : 'negative'}>
                {c.change24h >= 0 ? `▲ ${c.change24h}%` : `▼ ${Math.abs(c.change24h)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinList;