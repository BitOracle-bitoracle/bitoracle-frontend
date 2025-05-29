import React, { useState, useRef, useEffect } from 'react';
import './PredictionChart.css';
import moment from 'moment';
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
} from 'recharts';

// 예시 더미 데이터
// 실제로는 백엔드에서 받아온 시계열 [{ date: '2025-05-01', actual: 13500000, predicted: 13600000 }, …]
const sampleData = [
  { date: '2025-05-01', actual: 13200000, predicted: 13350000 },
  { date: '2025-05-02', actual: 13450000, predicted: 13500000 },
  { date: '2025-05-03', actual: 13600000, predicted: 13720000 },
  // ... 추가 데이터
];

const PredictionChart = ({ data = sampleData }) => {
  // 날짜 문자열을 타임스탬프로 변환
  const chartData = data.map((d, i) => ({ ...d, timestamp: new Date(d.date).getTime() }));

  // 기간 선택 상태
  const [range, setRange] = useState('1M'); // '2W' | '1M' | '6M'

  // 기간 필터링
  const now = chartData[chartData.length - 1]?.timestamp || Date.now();
  const getStartTime = () => {
    switch (range) {
      case '2W':
        return moment(now).subtract(14, 'days').valueOf();
      case '1M':
        return moment(now).subtract(1, 'months').valueOf();
      case '6M':
        return moment(now).subtract(6, 'months').valueOf();
      default:
        return chartData[0]?.timestamp;
    }
  };
  const filteredData = chartData.filter(d => d.timestamp >= getStartTime());

  // 도메인 상태: [시작, 끝]
  const [domain, setDomain] = useState([
    filteredData[0]?.timestamp || now,
    filteredData[filteredData.length - 1]?.timestamp || now,
  ]);
  const containerRef = useRef(null);

  // 휠로 Zoom in/out 처리
  const onWheel = e => {
    e.preventDefault();
    const [start, end] = domain;
    const delta = (end - start) * 0.1; // 10% zoom
    if (e.deltaY < 0) {
      // zoom in
      setDomain([
        start + delta,
        end - delta,
      ]);
    } else {
      // zoom out
      setDomain([
        Math.max(filteredData[0]?.timestamp ?? start, start - delta),
        Math.min(filteredData[filteredData.length - 1]?.timestamp ?? end, end + delta),
      ]);
    }
  };

  // domain 초기화 (range 바뀔 때)
  useEffect(() => {
    if (filteredData.length > 0) {
      setDomain([
        filteredData[0].timestamp,
        filteredData[filteredData.length - 1].timestamp,
      ]);
    }
  }, [range]);

  return (
    <div className="prediction-chart-wrapper" style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: 400,
            position: 'relative',
            cursor: 'default',
            userSelect: 'none',
          }}
          onWheel={onWheel}
        >
          {/* chart title */}
          <div className="prediction-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/icons/Bitcoin.png" alt="Bitcoin" style={{ width: '24px', height: '24px' }} />
              비트코인 가격 예측 차트
            </h2>
          </div>
          {/* 기간 선택 버튼 */}
          <div className="prediction-controls">
            {['2W', '1M', '6M'].map(r => (
              <button
                key={r}
                className={r === range ? 'active' : ''}
                onClick={() => setRange(r)}
              >
                {r === '2W' ? '2주' : r === '1M' ? '1개월' : '6개월'}
              </button>
            ))}
          </div>
          <ResponsiveContainer>
            <ComposedChart
              data={filteredData}
              margin={{ top: 40, right: 50, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                domain={domain}
                type="number"
                tickFormatter={ts => moment(ts).format('YYYY-MM-DD')}
              />
              <YAxis tickFormatter={value => `${(value / 1e6).toFixed(1)}M`} />
              <Tooltip
                labelFormatter={label => moment(label).format('YYYY-MM-DD')}
                formatter={(value, name) => [
                  value.toLocaleString(),
                  name === 'actual' ? '실제 BTC' : '예측 BTC',
                ]}
              />
              <Legend verticalAlign="top" height={36} />
              {/* 실제 가격 영역 */}
              <Area
                type="monotone"
                dataKey="actual"
                name="실제 BTC"
                stroke="#1f77b4"
                fill="#1f77b4"
                fillOpacity={0.2}
              />
              {/* 예측 가격 선 */}
              <Line
                type="monotone"
                dataKey="predicted"
                name="예측 BTC"
                stroke="#ff7f0e"
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
