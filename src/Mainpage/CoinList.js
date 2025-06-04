import React, { useEffect, useState } from 'react';
import './CoinList.css';

const staticCoins = [
  { id: 'btc', rank: 1, name: '비트코인', symbol: 'BTC', icon: '/icons/btc.png' },
  { id: 'eth', rank: 2, name: '이더리움', symbol: 'ETH', icon: '/icons/eth.png' },
  { id: 'xrp', rank: 3, name: '리플', symbol: 'XRP', icon: '/icons/xrp.png' }
];

const CoinList = () => {
  const [coins, setCoins] = useState(staticCoins.map(coin => ({
    ...coin,
    price: 0,
    volume24h: 0,
    change24h: 0,
    marketCap: 0
  })));

  useEffect(() => {
    const ws = new WebSocket("wss://api.bitoracle.shop/sub/trade");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const merged = staticCoins.map(coin => {
          const dynamic = data.find(d => d.symbol === coin.symbol);
          return {
            ...coin,
            price: dynamic?.price || 0,
            volume24h: dynamic?.volume24h || 0,
            change24h: dynamic?.change24h || 0,
          };
        });
        setCoins(merged);
      } catch (err) {
        console.error("WebSocket 응답 JSON 파싱 오류:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket 연결 오류:", err);
    };

    return () => {
      ws.close();
    };
  }, []);

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
          {coins.map((c) => (
            <tr key={c.id || c.rank} className="coin-cell">
              <td>{c.rank}</td>
              <td className="coin-cell">
                <img
                  src={c.icon}
                  alt=""
                  className="coin-icon"
                />
                <span className="coin-name">{c.name}</span>
                <span className="symbol">{c.symbol}</span>
              </td>
              <td>{Number(c.price).toLocaleString()}₩</td>
              <td>{Number(c.marketCap).toLocaleString()}₩</td>
              <td>{Number(c.volume24h).toLocaleString()}₩</td>
              <td className={c.change24h >= 0 ? 'positive' : 'negative'}>
                {c.change24h >= 0
                  ? `▲ ${c.change24h.toFixed(2)}%`
                  : `▼ ${Math.abs(c.change24h).toFixed(2)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinList;