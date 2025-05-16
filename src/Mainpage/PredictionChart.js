import React, { useState, useRef, useEffect } from 'react';
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

  // Pan 지원 (drag)
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const domainStartOnDrag = useRef(null);

  const onMouseDown = (e) => {
    console.log('✅ 드래그 시작');
    isDragging.current = true;
    dragStart.current = e.clientX;
    domainStartOnDrag.current = domain;
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    console.log('➡️ 드래그 이동 중');
    const dx = e.clientX - dragStart.current;
    const [start0, end0] = domainStartOnDrag.current;
    const pxRange = Math.max(1, containerRef.current?.offsetWidth || 0);
    const timeRange = end0 - start0;
    const dt = -(dx / pxRange) * timeRange;
    const newStart = Math.max(filteredData[0]?.timestamp ?? start0, start0 + dt);
    const newEnd = Math.min(filteredData[filteredData.length - 1]?.timestamp ?? end0, end0 + dt);
    setDomain([newStart, newEnd]);
  };
  const onMouseUp = () => {
    isDragging.current = false;
  };

  // domain 초기화 (range 바뀔 때)
  useEffect(() => {
    if (filteredData.length > 0) {
      setDomain([
        filteredData[0].timestamp,
        filteredData[filteredData.length - 1].timestamp,
      ]);
    }
  }, [range, filteredData]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 400,
        position: 'relative',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* 기간 선택 버튼 */}
      <div style={{ position: 'absolute', top: 0, right: 10, zIndex: 2 }}>
        {['2W', '1M', '6M'].map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              marginLeft: 4,
              padding: '4px 8px',
              background: r === range ? '#1f77b4' : '#eee',
              color: r === range ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {r === '2W' ? '2주' : r === '1M' ? '1개월' : '6개월'}
          </button>
        ))}
      </div>
      <ResponsiveContainer>
        <ComposedChart
          data={filteredData}
          margin={{ top: 40, right: 50, bottom: 20, left: 0 }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
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
  );
};

export default PredictionChart;
