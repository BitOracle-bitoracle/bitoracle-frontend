import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import './CoinList.css';

const staticCoins = [
  { id: 'btc', rank: 1, name: '비트코인', symbol: 'BTC', icon: '/icons/btc.png' },
  { id: 'eth', rank: 2, name: '이더리움', symbol: 'ETH', icon: '/icons/eth.png' },
  { id: 'xrp', rank: 3, name: '리플', symbol: 'XRP', icon: '/icons/xrp.png' }
];

const CoinList = () => {
  const [coins, setCoins] = useState(
    staticCoins.map(coin => ({
      ...coin,
      price: 0,
      volume24h: 0,
      change24h: 0,
      marketCap: 0
    }))
  );

  useEffect(() => {
    // STOMP 클라이언트 생성 (WebSocket 직접 연결)
    const stompClient = new Client({
      brokerURL: 'wss://api.bitoracle.shop/ws-upbit',
      reconnectDelay: 5000 // 재연결 시도 간격 (ms)
    });

    // 3) 연결이 열리면 '/sub/trade' 구독
    stompClient.onConnect = (frame) => {
      stompClient.subscribe(
        '/sub/trade',
        (message) => {
          if (message.body) {
            try {
              const payload = JSON.parse(message.body);
              // STOMP sends a single trade object per message
              const update = payload;
              // console.log('Received trade update:', update.code, update);
              // if (update.code.endsWith('-XRP')) {
              //   console.log('XRP update details:', update);
              // }
              // Update only the matching coin, keep others unchanged
              setCoins(prevCoins =>
                prevCoins.map(c => {
                  if (!update.code || !update.code.endsWith(`-${c.symbol}`)) {
                    return c;
                  }
                  return {
                    ...c,
                    price: update.price ?? c.price,
                    volume24h: update.volume_24h ?? c.volume24h,
                    change24h: update.change_rate_24h ? update.change_rate_24h * 100 : c.change24h,
                    // marketCap remains unchanged here or use update.market_cap if provided
                    marketCap: c.marketCap
                  };
                })
              );
            } catch (err) {
              console.error('STOMP 메시지 JSON 파싱 오류:', err);
            }
          }
        }
      );
    };

    // 4) 연결 오류 처리
    stompClient.onStompError = (frame) => {
      console.error('STOMP 에러:', frame.headers['message'], frame.body);
    };

    // 5) 실제 접속
    stompClient.activate();

    return () => {
      // 언마운트 시 연결 해제
      stompClient.deactivate();
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
              <td>{c.price ? `₩${Number(c.price).toLocaleString()}` : '–'}</td>
              <td>{c.volume24h ? `₩${Number(c.volume24h).toLocaleString()}` : '–'}</td>
              <td className={c.change24h >= 0 ? 'positive' : 'negative'}>
                {c.change24h
                  ? (c.change24h >= 0 ? `▲ ${c.change24h.toFixed(2)}%` : `▼ ${Math.abs(c.change24h).toFixed(2)}%`)
                  : '–'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinList;