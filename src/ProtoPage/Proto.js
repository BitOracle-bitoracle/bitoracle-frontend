import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";

import "./Proto.css";

const BASE_URL = "https://api.bitoracle.shop/api/predict";

const Proto = () => {
    const handlePrdictBtnClick = async (predictType) => {
        const token = localStorage.getItem("access");

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/select`, predictType);
            alert(`${predictType}을 선택하셨습니다.`);
            console.log("Success to post predict.", res);
        } catch (error) {
            console.error("Fail to post predict.", error);
        }
    };

    return (
        <div className="proto-container">
            <div className="proto-left">
                <CoinIndex />
                <div className="middle-placeholder" />
                <div className="btn-wrapper">
                    <button
                        className="prediction-btn"
                        onClick={() => {
                            handlePrdictBtnClick("UP");
                        }}
                    >
                        업
                    </button>
                    <button
                        className="prediction-btn"
                        onClick={() => {
                            handlePrdictBtnClick("DOWN");
                        }}
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
    );
};

const CoinIndex = () => {
    const [price, setPrice] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            alert("로그인하세요!");
            return;
        }

        axios
            .get(`${BASE_URL}/midnight`)
            .then((res) => {
                console.log("today 0d coin data:", res);
                setPrice(res.data.data.price);
            })
            .catch((error) => {
                console.error("Fail to get coin index.", error);
            });
    }, []);

    return (
        <div className="inform-wrapper">
            <h4>내일 0시 가격은 오늘 0시 가격보다 높을까요?</h4>
            <span className="inform-box">오늘 0시 비트코인: {price}</span>
            {/* <span className="inform-box">비트코인 현재가: {}</span> */}
        </div>
    );
};

const StatCalendar = () => {
    const [predictions, setPredictions] = useState({});

    const tileContent = ({ date, view }) => {
        if (view !== "month") return null;

        const dateStr = date.toISOString().slice(0, 10); // 'YYYY-MM-DD'

        const result = predictions[dateStr];
        if (result === "success") {
            return <div className="marker success" />;
        } else if (result === "fail") {
            return <div className="marker fail">✖</div>;
        }
        return null;
    };

    const getPredictions = async () => {
        const token = localStorage.getItem("access");

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const res = await axios.get(`${BASE_URL}/calendar`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true, // Cookie 전달함.
            });
            console.log("Success to get predictions.", res);

            const resultMap = {};
            res.data.data?.forEach((item) => {
                resultMap[item.created_at] = item.correct;
            });
            setPredictions(resultMap);
        } catch (error) {
            console.error("Fail to get predictions.", error);
        }
    };

    useEffect(() => {
        getPredictions();
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
                console.log("Success to get stats:", res);
                setStats(res.data.data);
            })
            .catch((error) => {
                console.error("Fail to get stats.", error);
            });
    }, []);

    return (
        <div className="proto-stat">
            {" "}
            {stats ? (
                <div>
                    <span className="stats-text">총 {stats.trial}</span>
                    <span className="stats-text">성공 {stats.success}</span>
                    <span className="stats-text">실패 {stats.failure}</span>
                    <br />
                    <span className="stats-text">
                        승률{" "}
                        {stats.trial > 0
                            ? (stats.success * 100) / stats.trial
                            : 0}
                        %
                    </span>
                </div>
            ) : (
                <span className="stats-text">아직 통계가 없어요!</span>
            )}
        </div>
    );
};

export default Proto;
