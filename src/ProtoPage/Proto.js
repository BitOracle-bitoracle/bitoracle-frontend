import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";

import "./Proto.css";

const BASE_URL = "https://api.bitoracle.shop/api/predict";

const Proto = () => {
    const [isPredicted, setIsPredicted] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        axios
            .get(`${BASE_URL}/check`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true, // Cookie 전달함.
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
                withCredentials: true, // Cookie 전달함.
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
            {/* <span className="inform-box">비트코인 현재가: {}</span> */}
        </div>
    );
};

const StatCalendar = () => {
    const [predictions, setPredictions] = useState({});

    const tileContent = ({ date, view }) => {
        const dateStr = date.toISOString().slice(0, 10); // 'YYYY-MM-DD'

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

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        axios
            .get(`${BASE_URL}/calendar`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true, // Cookie 전달함.
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
            maxDate={new Date()} // 오늘까지만 선택 가능
            formatDay={(locale, date) => date.getDate()}
        />
    );
};

const StatText = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        axios
            .get(`${BASE_URL}/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true, // Cookie 전달함.
            })
            .then((res) => {
                console.log("Success to get stats:", res.data);
                setStats(res.data.data);
            })
            .catch((error) => {
                console.error("Fail to get stats.", error);
            });
    }, []);

    return (
        <div>
            {stats ? (
                <div className="proto-stat">
                    <div className="stat-row">
                        <span className="stats-text">총 {stats.trial}</span>
                        <span className="stats-text">성공 {stats.success}</span>
                        <span className="stats-text">실패 {stats.failure}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stats-text">
                            승률{" "}
                            {stats.trial > 0
                                ? Math.round(
                                      (stats.success * 100) / stats.trial
                                  )
                                : 0}
                            %
                        </span>
                    </div>
                </div>
            ) : (
                <span className="stats-text">아직 통계가 없어요!</span>
            )}
        </div>
    );
};

export default Proto;
