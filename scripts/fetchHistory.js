// scripts/fetchHistory.js
const axios = require('axios')
const fs = require('fs')
const path = require('path')

async function fetchAndSave() {
  // CoinGecko에서 전체 히스토리 가져오기 (vs_currency=krw, days=max)
  const { data } = await axios.get(
    'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
    { params: { vs_currency: 'krw', days: 'max' } }
  )

  // data.prices: [[timestamp, price], ...]
  const allPrices = data.prices.map(([ts, price]) => ({
    date: new Date(ts).toISOString().slice(0, 10),    // YYYY-MM-DD
    actual: Math.round(price),
    predicted: Math.round(price)                     // 임시로 actual과 동일하게 넣어둡니다
  }))

  // 2020-01-01 이후 데이터만 필터
  const filtered = allPrices.filter(p => p.date >= '2020-01-01')

  // 파일로 쓸 내용
  const out = `// src/DummyData/bitcoinHistory.js
// 자동 생성: ${new Date().toISOString()}
// 2020-01-01 부터 현재까지의 일별 BTC 가격(KRW)
export const bitcoinHistory = ${JSON.stringify(filtered, null, 2)};
`

  const dest = path.resolve(__dirname, '../src/DummyData/bitcoinHistory.js')
  fs.writeFileSync(dest, out, 'utf-8')
  console.log(`✅ ${filtered.length}개 항목을 ${dest}에 저장했습니다.`)
}

fetchAndSave().catch(err => {
  console.error(err)
  process.exit(1)
})