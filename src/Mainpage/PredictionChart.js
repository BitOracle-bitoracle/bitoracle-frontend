import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./PredictionChart.css";

const dummyData = [
  { time: "10:00", price: 69000 },
  { time: "11:00", price: 69300 },
  { time: "12:00", price: 69150 },
  { time: "13:00", price: 69500 },
  { time: "14:00", price: 69720 },
  { time: "15:00", price: 69600 },
];

const PredictionChart = () => {
  return (
    <div className="prediction-panel">
      <h2 className="prediction-title">📈 비트코인 가격 예측</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dummyData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#1a73e8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionChart;