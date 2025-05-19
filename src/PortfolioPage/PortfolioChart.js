import React from "react";
import "./PortfolioChart.css";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FFC107"];

const PortfolioChart = ({ holdings, dummyPrices }) => {
  return (
    <div className="overview-right">
      <ResponsiveContainer width={240} height={240}>
        <PieChart>
          <Pie
            data={holdings.map(item => ({
              name: item.coin,
              value: item.amount * (dummyPrices[item.coin] || 0)
            }))}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {holdings.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;