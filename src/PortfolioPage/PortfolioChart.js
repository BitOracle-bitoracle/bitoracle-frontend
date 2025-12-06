import React from "react";
import "./PortfolioChart.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// 세련된 그라데이션 색상
const COLORS = [
  "#FF6B9D", // 핑크
  "#C44FFF", // 퍼플
  "#4FACFE", // 블루
  "#00F2FE", // 시안
  "#43E97B", // 그린
  "#FFB347", // 오렌지
];

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const total = payload[0].payload.total;
    const percentage = ((payload[0].value / total) * 100).toFixed(1);
    const coinColor = COLORS[payload[0].payload.index % COLORS.length];
    
    return (
      <div className="chart-tooltip">
        <div className="tooltip-coin">
          <span className="tooltip-dot" style={{ background: coinColor, boxShadow: `0 0 12px ${coinColor}` }} />
          {payload[0].name}
        </div>
        <div className="tooltip-value">
          ₩{payload[0].value.toLocaleString()}
        </div>
        <div className="tooltip-percent">{percentage}%</div>
      </div>
    );
  }
  return null;
};

// 커스텀 레이블 (차트 안에 표시)
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null; // 5% 미만은 레이블 표시 안함
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: '12px',
        fontWeight: '600',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PortfolioChart = ({ holdings = [] }) => {
  const total = holdings.reduce((acc, item) => {
    return acc + item.amount * (item.currentPrice ?? item.avgPrice ?? 0);
  }, 0);

  const chartData = holdings
    .map((item, index) => ({
      name: item.coin,
      value: item.amount * (item.currentPrice ?? item.avgPrice ?? 0),
      total: total,
      fill: COLORS[index % COLORS.length],
      index: index,
    }))
    .filter(item => item.value > 0);

  return (
    <div className="overview-right">
      <div className="chart-wrapper">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={3}
                cornerRadius={6}
                label={renderCustomLabel}
                labelLine={false}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-${index % COLORS.length})`}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={1}
                    style={{ filter: 'url(#glow)' }}
                  />
                ))}
              </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
        
        {/* 범례 */}
        <div className="chart-legend">
          {chartData.map((entry, index) => (
            <div key={index} className="legend-item">
              <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} />
              <span className="legend-name">{entry.name}</span>
              <span className="legend-percent">
                {((entry.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
