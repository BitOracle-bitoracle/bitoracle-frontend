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

      // (A) 인증 상태 확인
      try {
        await axiosInstance.get('/api/auth/init');
      } catch (authErr) {
        // 인증 실패 시: 403 또는 "Refresh token mismatch" 메시지
        if (
          (authErr.response && authErr.response.status === 403) ||
          (authErr.response && typeof authErr.response.data === 'string' && authErr.response.data.includes('Refresh token mismatch')) ||
          (authErr.message && authErr.message.includes('Network Error'))
        ) {
          setLoading(false);
          return;
        }
        // 기타 인증 오류는 기존대로 에러 처리
        setError(authErr);
        setLoading(false);
        setChartData([]);
        return;
      }

      try {
        let actualRaw = [];
        try {
          const realRes = await axiosInstance.get('/api/price/chart', {
            params: { startDate: start_date, endDate: end_date },
          });
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

        let predictRaw = [];
        try {
          const predictRes = await axiosInstance.post('/predict-now', {});
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

        const actualMap = {};
        actualRaw.forEach((row) => {
          actualMap[row.date] = row.actual;
        });

        const merged = predictRaw.map((row) => {
          const dateStr = row.date;
          const actualValue =
            typeof row.actual === 'number'
              ? row.actual
              : actualMap[dateStr] ?? 0;
          return {
            date: dateStr,
            timestamp: new Date(dateStr).getTime(),
            actual: actualValue,
            predicted: row.predicted,
          };
        });

        setChartData(merged);
        if (merged.length > 0) {
          setDomain([merged[0].timestamp, merged[merged.length - 1].timestamp]);
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
                  margin={{ top: 40, right: 50, bottom: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    domain={domain}
                    type="number"
                    tickFormatter={(ts) => moment(ts).format('YYYY-MM-DD')}
                  />
                  <YAxis tickFormatter={(val) => `${(val / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    labelFormatter={(label) => moment(label).format('YYYY-MM-DD')}
                    formatter={(value, name) => [
                      value.toLocaleString(),
                      name === 'actual' ? '실제 BTC' : '예측 BTC',
                    ]}
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