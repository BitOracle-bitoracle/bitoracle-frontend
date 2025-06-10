import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./News.css";

// 05-10
// TODO 페이지네이션 위치 고정하기
// TODO 요약글 대신 날짜 우측 정렬로 추가

const BASE_URL = "https://api.bitoracle.shop/news";
const ITEMS_PER_PAGE = 5;

const News = () => {
    const [topic, setTopic] = useState("bitcoin");
    const [goodCurPage, setGoodCurPage] = useState(0);
    const [badCurPage, setBadCurPage] = useState(0);
    const [goodTotalPages, setGoodTotalPages] = useState(0);
    const [badTotalPages, setBadTotalPages] = useState(0);
    const [goodNews, setGoodNews] = useState({});
    const [badNews, setBadNews] = useState({});

    useEffect(() => {
        fetchTopic(setTopic);
        fetchGoodNews(setGoodCurPage, setGoodTotalPages, setGoodNews, {
            page: badCurPage,
            size: ITEMS_PER_PAGE,
        });
        fetchBadNews(setBadCurPage, setBadTotalPages, setBadNews);
    }, []);

    return (
        <div className="news-container">
            <div className="news-header">
                <h1>뉴스</h1>
                <h4>AI가 뽑은 호재/악재 뉴스로 핵심만 빠르게 파악하세요.</h4>
            </div>

            <div className="topic-bar">
                <span>AI가 뽑은 오늘의 토픽: </span>
                <strong>{topic}</strong>
            </div>

            <div className="news-index">
                <span>호재</span>
                <span>악재</span>
            </div>

            <div className="news-items">
                <div className="good_news-items">
                    {goodNews.map((news) => (
                        <a
                            key={news.id}
                            className="news-item"
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {news.title}
                        </a>
                    ))}
                    <CustomPagination
                        currentPage={goodCurPage}
                        totalPages={Math.ceil(
                            goodNewsData.length / ITEMS_PER_PAGE
                        )}
                        onPageChange={setGoodCurPage}
                    />
                </div>

                <div className="bad_news-items">
                    {badNews.map((news) => (
                        <a
                            key={news.id}
                            className="news-item"
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {news.title}
                        </a>
                    ))}
                    <CustomPagination
                        currentPage={badCurPage}
                        totalPages={Math.ceil(
                            badNewsData.length / ITEMS_PER_PAGE
                        )}
                        onPageChange={setBadCurPage}
                    />
                </div>
            </div>
        </div>
    );
};

async function fetchTopic(setTopic) {
    try {
        const res = await axios.get(`${BASE_URL}/kw`);
        console.log("Success to get today`s topic\n", res);
        setTopic(res.data?.kw);
    } catch (error) {
        console.error("Fail to get today`s topic\n", error);
    }
}

async function fetchGoodNews(setGoodCurPage, setGoodTotalPages, setGoodNews, request) {
    try {
        const res = await axios.get(`${BASE_URL}/goodNews`, request);
        console.log("Success to get good news.\n", res);

        setGoodCurPage(request.page);
        setGoodTotalPages();
        setGoodNews();

    } catch (error) {
        console.error("Fail to get good news.\n", error);
    }
}

async function fetchBadNews(setBadCurPage, setBadTotalPage, setBadNews) {
    // try {
    //     const res = await axios.get(`${BASE_URL}/kw`);
    //     console.log("Success to get bad news.\n", res);
    //     setTopic(res.data?.kw);
    // } catch (error) {
    //     console.error("Fail to get bad news.\n", error);
    // }
}

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    const navigate = useNavigate();

    const MAX_PAGE_DISPLAY = 5;

    const handleClick = (page) => {
        if (page !== currentPage && page >= 0 && page < totalPages) {
            onPageChange(page);
            navigate(`?page=${page + 1}`);
        }
    };

    const getPageNumbers = () => {
        let pages = [];

        const startPage = Math.max(
            0,
            Math.min(currentPage - 2, totalPages - MAX_PAGE_DISPLAY)
        );
        const endPage = Math.min(
            startPage + MAX_PAGE_DISPLAY - 1,
            totalPages - 1
        );

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return { pages, startPage };
    };

    const { pages, startPage } = getPageNumbers();

    return (
        <ul className="custom-pagination">
            {/* 앞으로 */}
            <li
                className={`page-btn ${currentPage === 0 ? "disabled" : ""}`}
                onClick={() => handleClick(currentPage - 1)}
            >
                {"<"}
            </li>

            {/* 1 ... 생략 */}
            {startPage > 0 && (
                <>
                    <li className="page-btn" onClick={() => handleClick(0)}>
                        1
                    </li>
                    <li className="page-ellipsis">...</li>
                </>
            )}

            {/* 메인 페이지 번호들 */}
            {pages.map((page) => (
                <li
                    key={page}
                    className={`page-btn ${
                        page === currentPage ? "active" : ""
                    }`}
                    onClick={() => handleClick(page)}
                >
                    {page + 1}
                </li>
            ))}

            {/* 다음으로 */}
            <li
                className={`page-btn ${
                    currentPage === totalPages - 1 ? "disabled" : ""
                }`}
                onClick={() => handleClick(currentPage + 1)}
            >
                {">"}
            </li>
        </ul>
    );
};

export default News;
