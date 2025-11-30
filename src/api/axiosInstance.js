// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.bitoracle.shop", // 실제 백엔드 API 도메인
  // baseURL: 'http://localhost:8000', // 로컬 테스트용
  withCredentials: true, // 필요 시 설정 (쿠키 등)
  headers: {
    "Content-Type": "application/json",
    // Authorization 헤더가 필요한 경우, 아래처럼 토큰 추가 가능:
    // "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
  },
});

export default axiosInstance;