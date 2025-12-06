import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";

import "./Proto.css";

const BASE_URL = "https://api.bitoracle.shop/api/predict";
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const Proto = () => {
    const [isPredicted, setIsPredicted] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token && !isLocalhost) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!token) return; // localhost에서 토큰 없으면 API 호출 스킵

        axios
            .get(`${BASE_URL}/check`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            })
            .then((res) => {
                console.log("user isPredicted: ", res);
                setIsPredicted(res.data.data.predicted);
            })
            .catch((error) => {
                console.error("Fail to check isPredicted.", error);
            });
    }, []);

    const handlePredictBtnClick = async (predictType) => {
        const token = localStorage.getItem("access");

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/select`, predictType, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            console.log("Success to post predict.", res);
            alert(`${predictType.upDown}을 선택하셨습니다.`);
        } catch (error) {
            console.error("Fail to post predict.", error);
        }
    };

    return (
        <div className="proto-container">
            <div className="proto-content">
            <div className="proto-left">
                <CoinIndex />
                <div className="middle-placeholder" />
                <div className="btn-wrapper">
                    <button
                        className="prediction-btn"
                        onClick={() => {
                            handlePredictBtnClick({ upDown: "UP" });
                            setIsPredicted(true);
                        }}
                        disabled={isPredicted}
                    >
                        업
                    </button>
                    <button
                        className="prediction-btn"
                        onClick={() => {
                            handlePredictBtnClick({ upDown: "DOWN" });
                            setIsPredicted(true);
                        }}
                        disabled={isPredicted}
                    >
                        다운
                    </button>
                </div>
            </div>

            <div className="proto-right">
                <div className="proto-calendar">
                    <StatCalendar />
                </div>
                <div className="proto-stat">
                    <StatText />
                </div>
            </div>
        </div>
        </div>
    );
};

const CoinIndex = () => {
    const [price, setPrice] = useState(null);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/midnight`)
            .then((res) => {
                console.log("today 0d coin data:", res.data);
                setPrice(res.data.data.price);
            })
            .catch((error) => {
                console.error("Fail to get coin index.", error);
            });
    }, []);

    return (
        <div className="inform-wrapper">
            <h1>가격예측</h1>
            <h4>내일 00시 비트코인은 오늘보다 오를까요?</h4>
            <div className="middle-placeholder"/>
            <h4 className="inform-box">오늘 00시 비트코인</h4>
            <p className="inform-value">{price}원</p>
        </div>
    );
};

const StatCalendar = () => {
    const [predictions, setPredictions] = useState({});

    const tileContent = ({ date, view }) => {
        const dateStr = date.toISOString().slice(0, 10);

        if (predictions[dateStr] === "true") {
            return <span className="marker-success">●</span>; 
        }
        else if (predictions[dateStr] === "false") {
            return <span className="marker-fail">✖</span>;
        }
        return null;
    };

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token && !isLocalhost) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!token) return; // localhost에서 토큰 없으면 API 호출 스킵

        axios
            .get(`${BASE_URL}/calendar`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            })
            .then((res) => {
                const resultMap = {};

                res.data.data?.forEach((item) => {
                    resultMap[item.created_at] = item.correct;
                });
                setPredictions(resultMap);

                console.log("Success to get calendar.", res.data, resultMap);
            })
            .catch((error) => {
                console.error("Fail to get predictions.", error);
            });
    }, []);

    return (
        <Calendar
            tileContent={tileContent}
            maxDate={new Date()}
            formatDay={(locale, date) => date.getDate()}
        />
    );
};

const StatText = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token && !isLocalhost) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!token) return; // localhost에서 토큰 없으면 API 호출 스킵

        axios
            .get(`${BASE_URL}/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            })
            .then((res) => {
                console.log("Success to get stats:", res.data);
                setStats(res.data.data);
            })
            .catch((error) => {
                console.error("Fail to get stats.", error);
            });
    }, []);

    const winRate = stats && stats.trial > 0 
        ? Math.round((stats.success * 100) / stats.trial) 
        : 0;

    return (
        <div className="stat-content">
            {stats ? (
                <>
                    <div className="stat-header">
                        <h3 className="stat-title">📊 나의 예측 기록</h3>
                    </div>
                    <div className="stat-cards">
                        <div className="stat-card total">
                            <span className="stat-label">총 예측</span>
                            <span className="stat-value">{stats.trial}</span>
                        </div>
                        <div className="stat-card success">
                            <span className="stat-label">성공</span>
                            <span className="stat-value">{stats.success}</span>
                        </div>
                        <div className="stat-card failure">
                            <span className="stat-label">실패</span>
                            <span className="stat-value">{stats.failure}</span>
                        </div>
                    </div>
                    <div className="stat-winrate">
                        <div className="winrate-bar">
                            <div 
                                className="winrate-fill" 
                                style={{ width: `${winRate}%` }}
                            />
                        </div>
                        <div className="winrate-info">
                            <span className="winrate-label">승률</span>
                            <span className="winrate-value">{winRate}%</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="stat-empty">
                    <span className="empty-icon">📈</span>
                    <span className="empty-text">아직 통계가 없어요!</span>
                    <span className="empty-hint">예측에 참여해보세요</span>
                </div>
            )}
        </div>
    );
};

export default Proto;
