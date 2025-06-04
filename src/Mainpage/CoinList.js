import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
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
    // 1) SockJS 핸드쉐이킹 엔드포인트
    const sock = new SockJS('https://api.bitoracle.shop/ws-upbit');

    // 2) STOMP 클라이언트 생성
    const stompClient = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000 // 재연결 시도 간격 (ms)
    });

    // 3) 연결이 열리면 '/sub/trade' 구독
    stompClient.onConnect = (frame) => {
      console.log('STOMP 연결 성공:', frame);
      stompClient.subscribe('/sub/trade', (message) => {
        if (message.body) {
          try {
            const dataArray = JSON.parse(message.body);
            const merged = staticCoins.map(coin => {
              const match = dataArray.find(item => item.symbol === coin.symbol);
              return {
                ...coin,
                price: match?.price ?? 0,
                volume24h: match?.volume24h ?? 0,
                change24h: match?.change24h ?? 0,
                marketCap: match?.marketCap ?? 0
              };
            });
            setCoins(merged);
          } catch (err) {
            console.error('STOMP 메시지 JSON 파싱 오류:', err);
          }
        }
      });
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
              <td>{c.price ? `${Number(c.price).toLocaleString()}₩` : '–'}</td>
              <td>{c.marketCap ? `${Number(c.marketCap).toLocaleString()}₩` : '–'}</td>
              <td>{c.volume24h ? `${Number(c.volume24h).toLocaleString()}₩` : '–'}</td>
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