import React, { useState, useRef, useEffect } from 'react';
import './PredictionChart.css';
import moment from 'moment';
import axiosInstance from '../api/axiosInstance'; // axios 인스턴스( baseURL: https://api.bitoracle.shop )

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

const PredictionChart = () => {
  const containerRef = useRef(null);

  // 1) 사용자가 선택한 기간: '2W' | '1M' | '6M'
  const [range, setRange] = useState('1M');

  // 2) 차트에 쓸 데이터: [{ date, timestamp, actual, predicted }, …]
  const [chartData, setChartData] = useState([]);

  // 3) 로딩 & 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 4) X축 domain: [시작Timestamp, 끝Timestamp]
  const [domain, setDomain] = useState([Date.now(), Date.now()]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // ─────────────────────────────────────────────────────────
      // 1) today(종료일)
      const end_date = moment().format('YYYY-MM-DD');
      // 2) range에 따라 start_date 계산
      let start_date;
      if (range === '2W') {
        start_date = moment().subtract(14, 'days').format('YYYY-MM-DD');
      } else if (range === '1M') {
        start_date = moment().subtract(1, 'month').format('YYYY-MM-DD');
      } else {
        // '6M'
        start_date = moment().subtract(6, 'months').format('YYYY-MM-DD');
      }
      // ─────────────────────────────────────────────────────────


      try {
        let actualRaw = [];
        try {
          const realRes = await axiosInstance.get('/api/price/chart');
          actualRaw = Array.isArray(realRes.data)
            ? realRes.data
            : realRes.data.data || [];
        } catch (realErr) {
          // CORS/403 처리: 조용히 리턴
          if (
            (realErr.response && realErr.response.status === 403) ||
            (realErr.message && realErr.message.includes('Network Error'))
          ) {
            setLoading(false);
            return;
          }
          // 기타 오류는 빈 배열
          actualRaw = [];
        }
        console.log("✅ 실제 가격 데이터:", actualRaw);

        let predictRaw = [];
        try {
          const predictRes = await axiosInstance.get('/api/predict/chart');
          predictRaw = Array.isArray(predictRes.data)
            ? predictRes.data
            : predictRes.data.data || [];
        } catch (prErr) {
          // CORS/403 처리: 조용히 리턴
          if (
            (prErr.response && prErr.response.status === 403) ||
            (prErr.message && prErr.message.includes('Network Error'))
          ) {
            setLoading(false);
            return;
          }
          // 기타 오류는 빈 배열
          predictRaw = [];
        }
        console.log("📈 예측 가격 데이터:", predictRaw);

        const actualMap = {};
        actualRaw.forEach((row) => {
          actualMap[row.date] = row.actual;
        });

        const merged = predictRaw.map((row) => {
          const dateStr = row.date;
          const ts = new Date(dateStr).getTime();
          const today = moment().endOf('day').valueOf();
          const actualValue = ts > today ? undefined : actualMap[dateStr];
          return {
            date: dateStr,
            timestamp: ts,
            actual: actualValue,
            predicted: row.predicted,
          };
        });

        const startTs = new Date(start_date).getTime();
        // 미래 데이터도 예측은 보임, 실제 데이터는 오늘까지만, 날짜 필터는 시작 기준만 적용 (끝은 예측 포함을 위해 무제한)
        // timestamp가 undefined 아닌 값만 포함
        const filtered = merged.filter(row => {
          if (!row.timestamp) return false;
          return row.timestamp >= startTs;
        });

        setChartData(filtered);
        console.log("📊 통합된 차트 데이터:", filtered);
        if (filtered.length > 0) {
          setDomain([filtered[0].timestamp, filtered[filtered.length - 1].timestamp]);
        } else {
          const nowTs = Date.now();
          setDomain([nowTs, nowTs]);
        }
      } catch (err) {
        // CORS/403 처리: 조용히 리턴
        if (
          (err.response && err.response.status === 403) ||
          (err.message && err.message.includes('Network Error'))
        ) {
          setLoading(false);
          return;
        }
        setError(err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  // Compute min/max y values for dynamic YAxis domain
  const filtered = chartData;
  const yValues = filtered.flatMap(d => [d.actual ?? null, d.predicted ?? null]).filter(v => v !== null);
  const minY = yValues.length > 0 ? Math.min(...yValues) : 0;
  const maxY = yValues.length > 0 ? Math.max(...yValues) : 0;

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
        >
          {/* ─── 차트 상단 헤더 ───────────────────────────────────────── */}
          <div className="prediction-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="/icons/Bitcoin.png"
                alt="Bitcoin"
                style={{ width: '24px', height: '24px' }}
              />
              비트코인 가격 예측 차트
            </h2>
          </div>

          {/* ─── 로딩 / 에러 처리 ──────────────────────────────────────── */}
          {loading ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'red',
              }}
            >
              <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
          ) : (
            <>
              {/* ─── 기간 선택 버튼 ──────────────────────────────────────── */}
              <div className="prediction-controls">
                {['2W', '1M', '6M'].map((r) => (
                  <button
                    key={r}
                    className={r === range ? 'active' : ''}
                    onClick={() => setRange(r)}
                  >
                    {r === '2W' ? '2주' : r === '1M' ? '1개월' : '6개월'}
                  </button>
                ))}
              </div>

              {/* ─── 실제 + 예측 차트 ─────────────────────────────────────── */}
              <ResponsiveContainer>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 40, right: 50, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    domain={domain}
                    type="number"
                    tickFormatter={(ts) => moment(ts).format('YYYY-MM-DD')}
                  />
                  <YAxis
                    domain={[minY, maxY]}
                    tickFormatter={(val) => `₩${(val / 1e6).toFixed(0)}M`}
                    interval="preserveStartEnd"
                  />
                  <Tooltip
                    labelFormatter={(label) => moment(label).format('YYYY-MM-DD')}
                    formatter={(value, name) => {
                      const formatted = `₩${value.toLocaleString()}`;
                      if (name === 'actual') return [formatted, '실제 BTC'];
                      if (name === 'predicted') return [formatted, '예측 BTC'];
                      return [formatted, name];
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />

                  {/* 실제 가격 영역 (Area) */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="실제 BTC"
                    stroke="#1f77b4"
                    fill="#1f77b4"
                    fillOpacity={0.2}
                  />

                  {/* 예측 가격 선 (Line) */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;