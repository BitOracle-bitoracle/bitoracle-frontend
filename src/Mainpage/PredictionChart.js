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

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(20, 20, 30, 0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  fontSize: '13px'
};

const CustomActiveDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload) return null;

  // 50% 이상이면 초록(#00b894), 미만이면 빨강(#ff7675) -> 그라디언트/배지 색상과 통일
  const color = payload.probability >= 50 ? '#00b894' : '#ff7675';

  return (
    <svg>
      {/* 바깥쪽 은은한 광채 (Glow) */}
      <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.4} />
      {/* 안쪽 메인 점 (흰색 테두리로 가독성 확보) */}
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
    </svg>
  );
};

const PredictionChart = () => {
  const containerRef = useRef(null);
  const [range, setRange] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [chartHeight, setChartHeight] = useState(500);

  // SMA(이동평균) 계산
  const calculateSMA = (data, windowSize) => {
    return data.map((item, index, arr) => {
      const start = Math.max(0, index - windowSize + 1);
      const subset = arr.slice(start, index + 1);
      const sum = subset.reduce((acc, curr) => acc + curr.probability, 0);
      return { ...item, probability: sum / subset.length };
    });
  };

  useEffect(() => {
    const handleResize = () => setChartHeight(window.innerWidth <= 768 ? 380 : 480);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let start_date;
      if (range === '1D') start_date = moment().subtract(1, 'day');
      else if (range === '2W') start_date = moment().subtract(14, 'days');
      else if (range === '1M') start_date = moment().subtract(1, 'month');
      else start_date = moment().subtract(6, 'months');
      
      const startTs = start_date.valueOf();

      try {
        const [realRes, predictRes] = await Promise.allSettled([
            axiosInstance.get('http://3.36.74.196:8000/api/price/chart', { withCredentials: false }),
            axiosInstance.get('http://3.36.74.196:8000/api/predict/chart', { withCredentials: false })
        ]);

        const actualRaw = realRes.status === 'fulfilled' 
            ? (Array.isArray(realRes.value.data) ? realRes.value.data : realRes.value.data.data || []) : [];
        const predictRaw = predictRes.status === 'fulfilled'
            ? (Array.isArray(predictRes.value.data) ? predictRes.value.data : predictRes.value.data.data || []) : [];

        const actualMap = {};
        actualRaw.forEach((row) => { actualMap[row.date] = row.actual; });

        let merged = predictRaw.map((row) => {
          return {
            date: row.date,
            timestamp: new Date(row.date).getTime(),
            price: actualMap[row.date] || null,
            probability: row.predicted * 100, 
          };
        });

        merged = merged.filter((row) => row.timestamp >= startTs)
                       .sort((a, b) => a.timestamp - b.timestamp);

        const smoothWindow = range === '1D' ? 3 : range === '2W' ? 5 : range === '1M' ? 7 : 9;
        const smoothedData = calculateSMA(merged, smoothWindow);

        setChartData(smoothedData);
        setLatestPrediction(smoothedData.length > 0 ? smoothedData[smoothedData.length - 1] : null);

      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  const gradientOffset = () => {
    if (chartData.length === 0) return 0.5;
    const dataMax = Math.max(...chartData.map((i) => i.probability));
    const dataMin = Math.min(...chartData.map((i) => i.probability));
    if (dataMin >= 50) return 1; 
    if (dataMax <= 50) return 0; 
    return (dataMax - 50) / (dataMax - dataMin);
  };

  const off = gradientOffset();

  const getSignalInfo = (prob) => {
    if (prob >= 60) return { text: '강력 매수 (Strong Buy)', className: 'badge-strong-buy' };
    if (prob >= 50) return { text: '매수 우위 (Weak Buy)', className: 'badge-weak-buy' };
    if (prob >= 40) return { text: '매도 우위 (Weak Sell)', className: 'badge-weak-sell' };
    return { text: '강력 매도 (Strong Sell)', className: 'badge-strong-sell' };
  };

  return (
    <div className="prediction-chart-wrapper">
      <div className="prediction-header">
        
        {/* CSS 구조에 맞춰 계층 변경 */}
        <div className="header-top">
            
            {/* 1. 제목 그룹 */}
            <div className="header-title-group">
                <div className="title-row">
                    <img src="/icons/Bitcoin.png" alt="Bitcoin" style={{ width: '24px', height: '24px' }} />
                    <h2>AI 예측 트렌드 <span className="model-version">(GRU v14)</span></h2>
                </div>
            </div>

            {/* 2. 액션 그룹 (배지 + 버튼) */}
            <div className="header-actions-row">
                {/* 왼쪽: 배지 */}
                <div className="signal-slot">
                    {latestPrediction && (() => {
                        const info = getSignalInfo(latestPrediction.probability);
                        return (
                            <div className={`signal-badge ${info.className}`}>
                                {info.text} 
                                <span className="badge-prob">
                                    ({latestPrediction.probability.toFixed(1)}%)
                                </span>
                            </div>
                        );
                    })()}
                </div>

                {/* 오른쪽: 버튼 */}
                <div className="prediction-controls">
                    {['1D', '2W', '1M', '6M'].map((r) => (
                    <button key={r} className={r === range ? 'active' : ''} onClick={() => setRange(r)}>
                        {r === '1D' ? '1일' : r === '2W' ? '2주' : r === '1M' ? '1개월' : '6개월'}
                    </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading AI Model Data...</div>
      ) : error ? (
        <div className="error-state">데이터 로딩 실패</div>
      ) : (
        <div className="prediction-chart-container" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />

              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  {/* 🟢 위쪽 (상승): 형광 초록 */}
                  <stop offset={0} stopColor="#00ff9d" stopOpacity={0.9} /> {/* 꼭대기는 아주 진하게 */}
                  <stop offset={off} stopColor="#00ff9d" stopOpacity={0.25} /> {/* 바닥도 0이 아니라 은은하게 보이게 */}
                  
                  {/* 🔴 아래쪽 (하락): 형광 빨강/핑크 */}
                  <stop offset={off} stopColor="#ff4757" stopOpacity={0.25} /> {/* 천장도 은은하게 보이게 */}
                  <stop offset={1} stopColor="#ff4757" stopOpacity={0.9} />   {/* 바닥은 아주 진하게 */}
                </linearGradient>
              </defs>

              <XAxis
                dataKey="timestamp"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(ts) => (range === '1D' ? moment(ts).format('HH:mm') : moment(ts).format('MM/DD'))}
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                dy={10}
                tickCount={6}
                stroke="rgba(255,255,255,0.1)"
              />
              
              <YAxis
                yAxisId="left" 
                domain={['auto', 'auto']} 
                unit="%" 
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                label={{ value: '상승 확률', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.4)', style: {textAnchor: 'middle'} }}
                stroke="rgba(255,255,255,0.1)"
              />
              
              <YAxis
                yAxisId="right" orientation="right" domain={['auto', 'auto']}
                tickFormatter={(val) => `$${val.toLocaleString()}`} 
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                hide={window.innerWidth <= 768}
                stroke="rgba(255,255,255,0.1)"
              />

              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }} 
                itemStyle={{ color: '#fff' }}
                labelFormatter={(label) => moment(label).format('YYYY-MM-DD HH:mm')}
                formatter={(value, name, props) => {
                  const key = props?.dataKey || name;
                  if (key === 'price' || name === '실제 가격') {
                    const n = Number(value);
                    if (!Number.isFinite(n)) return ['-', '실제 가격'];
                    return [`$${Math.floor(n).toLocaleString()}`, '실제 가격'];
                  }
                  if (key === 'probability' || name === '상승 확률') {
                    const n = Number(value);
                    if (!Number.isFinite(n)) return ['-', '상승 확률'];
                    return [`${n.toFixed(1)}%`, '상승 확률'];
                  }
                  return [value, name];
                }}
              />
              
              <Legend verticalAlign="top" height={36} wrapperStyle={{ top: -10, right: 0, textAlign: 'right' }} iconSize={10} />

              <ReferenceLine yAxisId="left" y={50} stroke="rgba(255, 255, 255, 0.3)" strokeDasharray="3 3" />
              
              <Area
                yAxisId="left"
                type="basis"
                dataKey="probability"
                name="상승 확률"
                stroke="none"
                strokeWidth={0}
                fill="url(#splitColor)"
                fillOpacity={1}
                baseValue={50}
                activeDot={<CustomActiveDot />}
                isAnimationActive={false}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="price"
                name="실제 가격"
                stroke="#ffffff"
                dot={false}
                strokeWidth={2}
                opacity={1}
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.5))' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PredictionChart;