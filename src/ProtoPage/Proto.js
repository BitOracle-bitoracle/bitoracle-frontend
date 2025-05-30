import React, { useState } from "react";
import Calendar from "react-calendar";

import "./Proto.css";

const dummyResults = {
    "2025-05-19": "success",
    "2025-05-20": "fail",
    "2025-05-21": "success",
    "2025-05-22": "fail",
};

const Proto = () => {
    return (
        <div className="proto-container">
            <div className="proto-left">
                <div className="inform-wrapper">
                    <span className="inform-box">비트코인 00시 기준가격: </span>
                    <span className="inform-box">비트코인 현재가: </span>
                </div>
                <div className="middle-placeholder" />
                <div className="btn-wrapper">
                    <div className="prediction-btn">업</div>
                    <div className="prediction-btn">다운</div>
                </div>
            </div>

            <div className="proto-right">
                <div className="proto-calendar">
                    <StatCalendar></StatCalendar>
                </div>
                <div className="proto-stats">
                    <h2>총 4 성공 2 실패 2</h2>
                    <h2>승률 50%</h2>
                </div>
            </div>
        </div>
    );
};

const StatCalendar = () => {
    const [value, setValue] = useState(new Date());

    const getClassName = (date) => {
        const key = date.toISOString().split("T")[0];
        const result = dummyResults[key];
        if (result === "success") return "success-date";
        if (result === "fail") return "fail-date";
        return "";
    };

    return (
        <Calendar
            onChange={setValue}
            value={value}
            tileContent={({ date }) => (
                <div className={`tile-dot ${getClassName(date)}`}>
                    {date.getDate()}
                </div>
            )}
            maxDate={new Date()} // 오늘까지만 선택 가능
        />
    );
};

export default Proto;
