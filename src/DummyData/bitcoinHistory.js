// src/DummyData/bitcoinHistory.js
// 과거 비트코인 실제 가격 데이터(더미)
function getWeekdays(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  while (currentDate <= end) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateBitcoinHistory(startDate, endDate) {
  const dates = getWeekdays(startDate, endDate);
  const history = [];
  let basePrice = 7000000; // 시작 가격 (예: 7,000,000원)
  for (let i = 0; i < dates.length; i++) {
    // 실제값은 이전 값에서 -6% ~ +6% 변동
    const changePercent = (Math.random() * 12 - 6) / 100; // ±6% 변동
    basePrice = Math.round(basePrice * (1 + changePercent));
    // 예측값은 실제값 ±5% 랜덤 오차
    const errorPercent = (Math.random() * 10 - 5) / 100;
    const predicted = Math.round(basePrice * (1 + errorPercent));
    history.push({
      date: formatDate(dates[i]),
      actual: basePrice,
      predicted: predicted,
    });
  }
  return history;
}

export const bitcoinHistory = generateBitcoinHistory('2020-01-01', '2025-05-16');