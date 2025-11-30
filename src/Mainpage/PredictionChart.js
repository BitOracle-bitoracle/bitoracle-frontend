import React, { useState, useRef, useEffect } from 'react';
import './PredictionChart.css';
import moment from 'moment';
import axiosInstance from '../api/axiosInstance';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  Line,
  ReferenceLine
} from 'recharts';

const PredictionChart = () => {
  const containerRef = useRef(null);

  // 기간 선택 상태
  const [range, setRange] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null); // 최신 예측 값 저장

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 날짜 계산 로직 (기존 유지)
      let start_date;
      if (range === '2W') start_date = moment().subtract(14, 'days').format('YYYY-MM-DD');
      else if (range === '1M') start_date = moment().subtract(1, 'month').format('YYYY-MM-DD');
      else start_date = moment().subtract(6, 'months').format('YYYY-MM-DD');

      try {
        // 1. 실제 가격 데이터 가져오기
        let actualRaw = [];
        try {
          const realRes = await axiosInstance.get('/api/price/chart');
          actualRaw = Array.isArray(realRes.data) ? realRes.data : realRes.data.data || [];
        } catch (e) {
          console.error(e);
        }

        // 2. 예측 데이터 (0~1 사이 확률값 가정)
        let predictRaw = [];
        try {
          const predictRes = await axiosInstance.get('/api/predict/chart');
          predictRaw = Array.isArray(predictRes.data) ? predictRes.data : predictRes.data.data || [];
        } catch (e) {
          console.error(e);
        }

        // 데이터 병합
        const actualMap = {};
        actualRaw.forEach((row) => {
          actualMap[row.date] = row.actual;
        });

        const merged = predictRaw.map((row) => {
          const dateStr = row.date;
          const ts = new Date(dateStr).getTime();

          const prob = row.predicted; // 0~1 확률값

          return {
            date: dateStr,
            timestamp: ts,
            price: actualMap[dateStr], // 실제 가격 (참고용)
            probability: prob * 100, // 0~1 -> 0~100%
          };
        });

        // 필터링
        const startTs = new Date(start_date).getTime();
        const filtered = merged.filter((row) => row.timestamp >= startTs);

        // 날짜 오름차순 정렬
        filtered.sort((a, b) => a.timestamp - b.timestamp);

        setChartData(filtered);

        // 최신 예측 정보 세팅 (가장 마지막 데이터)
        if (filtered.length > 0) {
          setLatestPrediction(filtered[filtered.length - 1]);
        } else {
          setLatestPrediction(null);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  // 차트 그라디언트(초록/빨강)를 위한 오프셋 계산 (항상 50% 기준)
  const gradientOffset = () => {
    // 0~100 범위에서 50이 기준이므로 항상 0.5 (50%)
    return 0.5;
  };

  const off = gradientOffset();

  // 반응형 높이
  const [chartHeight, setChartHeight] = useState(window.innerWidth <= 768 ? 350 : 500);
  useEffect(() => {
    const handleResize = () => setChartHeight(window.innerWidth <= 768 ? 350 : 500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 현재 포지션 텍스트 생성기
  const getSignalText = (prob) => {
    if (prob >= 60) return { text: '강력 매수 (Strong Buy)', color: '#00ff88' };
    if (prob >= 50) return { text: '매수 우위 (Weak Buy)', color: '#82ca9d' };
    if (prob >= 40) return { text: '매도 우위 (Weak Sell)', color: '#ff8080' };
    return { text: '강력 매도 (Strong Sell)', color: '#ff4d4d' };
  };

  return (
    <div className="prediction-chart-wrapper">
      {/* ─── 1. 헤더: 비트코인 아이콘 + 현재 시그널 상태 ─── */}
      <div className="prediction-header">
        <div className="header-top">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/icons/Bitcoin.png" alt="Bitcoin" style={{ width: '24px', height: '24px' }} />
            AI 예측 트렌드 (GRU v14)
          </h2>
          {latestPrediction && (
            <div
              className="signal-badge"
              style={{
                border: `1px solid ${getSignalText(latestPrediction.probability).color}`,
                color: getSignalText(latestPrediction.probability).color,
                boxShadow: `0 0 10px ${getSignalText(latestPrediction.probability).color}40`,
              }}
            >
              {getSignalText(latestPrediction.probability).text}
              <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                ({latestPrediction.probability.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── 2. 로딩/에러 처리 ─── */}
      {loading ? (
        <div className="loading-state">Loading AI Model Data...</div>
      ) : error ? (
        <div className="error-state">데이터 로딩 실패</div>
      ) : (
        <>
          {/* ─── 3. 기간 선택 버튼 ─── */}
          <div className="prediction-controls">
            {['2W', '1M', '6M'].map((r) => (
              <button key={r} className={r === range ? 'active' : ''} onClick={() => setRange(r)}>
                {r === '2W' ? '2주' : r === '1M' ? '1개월' : '6개월'}
              </button>
            ))}
          </div>

          {/* ─── 4. 차트 영역 ─── */}
          <div ref={containerRef} style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                {/* 배경 그리드 */}
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" vertical={false} />

                {/* 그라디언트 정의 (50% 기준 위는 초록, 아래는 빨강) */}
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={0} stopColor="#00ff88" stopOpacity={0.4} />
                    <stop offset={off} stopColor="#00ff88" stopOpacity={0} />
                    <stop offset={off} stopColor="#ff4d4d" stopOpacity={0} />
                    <stop offset={1} stopColor="#ff4d4d" stopOpacity={0.4} />
                  </linearGradient>
                </defs>

                {/* X축 */}
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(ts) => moment(ts).format('MM/DD')}
                  stroke="rgba(255, 255, 255, 0.5)"
                  tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                  dy={10}
                />

                {/* Y축 (좌측): 확률 (%) */}
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  unit="%"
                  stroke="rgba(255, 255, 255, 0.5)"
                  tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                  label={{
                    value: '상승 확률',
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'rgba(255, 255, 255, 0.6)',
                  }}
                />

                {/* Y축 (우측): 실제 가격 (참고용) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₩${(val / 10000).toFixed(0)}만`}
                  stroke="rgba(255, 255, 255, 0.5)"
                  tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                  hide={window.innerWidth <= 768}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid #555',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(label) => moment(label).format('YYYY-MM-DD HH:mm')}
                  formatter={(value, name) => {
                    if (name === 'price') return [`₩${value.toLocaleString()}`, '실제 가격'];
                    if (name === 'probability') return [`${value.toFixed(2)}%`, '상승 확률'];
                    return [value, name];
                  }}
                />

                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ bottom: 0, left: 0, right: 0, textAlign: 'center' }} />

                {/* 50% 기준선 (중립 라인) */}
                <ReferenceLine
                  yAxisId="left"
                  y={50}
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Neutral',
                    fill: 'rgba(255, 255, 255, 0.8)',
                    position: 'insideRight',
                  }}
                />

                {/* 메인 데이터 1: 상승 확률 (Area Chart with Gradient) */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="probability"
                  name="상승 확률"
                  stroke="#fff"
                  strokeWidth={1}
                  fill="url(#splitColor)"
                />

                {/* 보조 데이터 2: 실제 가격 흐름 (Line Chart) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="price"
                  name="실제 가격"
                  stroke="#8884d8"
                  dot={false}
                  strokeWidth={2}
                  opacity={0.6}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionChart;