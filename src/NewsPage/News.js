import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./News.css";

// 05-10
// TODO 페이지네이션 위치 고정하기
// TODO 요약글 대신 날짜 우측 정렬로 추가

const BASE_URL = "https://api.bitoracle.shop/api/news";
const NEWS_PER_PAGE = 7;

const News = () => {
    const [topic, setTopic] = useState("bitcoin");

    const [goodCurPage, setGoodCurPage] = useState(0);
    const [goodTotalPages, setGoodTotalPages] = useState(0);
    const [goodNews, setGoodNews] = useState([]);

    const [badCurPage, setBadCurPage] = useState(0);
    const [badTotalPages, setBadTotalPages] = useState(0);
    const [badNews, setBadNews] = useState([]);

    useEffect(() => {
        fetchTopic(setTopic);

        // ISSUE: size params가 적용이 안되고 사이즈 고정되서 날라옴. 백엔드 문제.
        fetchGoodNews(setGoodCurPage, setGoodTotalPages, setGoodNews, {
            page: goodCurPage,
            size: NEWS_PER_PAGE,
        });

        fetchBadNews(setBadCurPage, setBadTotalPages, setBadNews, {
            page: badCurPage,
            size: NEWS_PER_PAGE,
        });
    }, [goodCurPage, badCurPage]);

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
                            key={`${news.news_title}-${news.created_at}`}
                            className="news-item"
                            href={news.news_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="title-box">{news.news_title}</span>
                            <span className="createdAt">
                                {new Date(news.created_at).toLocaleString(
                                    "ko-KR",
                                    {
                                        year: "2-digit",
                                        month: "2-digit",
                                        day: "2-digit",
                                    }
                                )}
                            </span>
                        </a>
                    ))}

                    <CustomPagination
                        currentPage={goodCurPage}
                        totalPages={goodTotalPages}
                        onPageChange={setGoodCurPage}
                    />
                </div>

                <div className="bad_news-items">
                    {badNews.map((news) => (
                        <a
                            key={`${news.news_title}-${news.created_at}`}
                            className="news-item"
                            href={news.news_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="title-box">{news.news_title}</span>
                            <span className="createdAt">
                                {new Date(news.created_at).toLocaleString(
                                    "ko-KR",
                                    {
                                        year: "2-digit",
                                        month: "2-digit",
                                        day: "2-digit",
                                    }
                                )}
                            </span>
                        </a>
                    ))}
                    <CustomPagination
                        currentPage={badCurPage}
                        totalPages={badTotalPages}
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
        setTopic(res.data.data.kw);
    } catch (error) {
        console.error("Fail to get today`s topic\n", error);
    }
}

async function fetchGoodNews(
    setGoodCurPage,
    setGoodTotalPages,
    setGoodNews,
    params
) {
    try {
        const res = await axios.get(`${BASE_URL}/goodNews`, params);
        console.log("Success to get good news.\n", res, params);

        setGoodCurPage(params.page);
        setGoodTotalPages(res.data.data.totalPages);
        setGoodNews(res.data.data.content);
    } catch (error) {
        console.error("Fail to get good news.\n", error);
    }
}

async function fetchBadNews(
    setBadCurPage,
    setBadTotalPages,
    setBadNews,
    params
) {
    try {
        const res = await axios.get(`${BASE_URL}/badNews`, params);
        console.log("Success to get bad news.\n", res, params);

        setBadCurPage(params.page);
        setBadTotalPages(res.data.data.totalPages);
        setBadNews(res.data.data.content);
    } catch (error) {
        console.error("Fail to get bad news.\n", error);
    }
}

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    const MAX_PAGE_DISPLAY = 5;

    const getPages = () => {
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

    const { pages, startPage } = getPages();

    return (
        <ul className="custom-pagination">
            {/* 앞으로 */}
            <li
                className={`page-btn ${currentPage === 0 ? "disabled" : ""}`}
                onClick={
                    currentPage === 0
                        ? undefined
                        : () => onPageChange(currentPage - 1)
                }
            >
                {"<"}
            </li>

            {/* 1 ... 생략 */}
            {startPage > 0 && (
                <>
                    <li className="page-btn" onClick={() => onPageChange(0)}>
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
                    onClick={() => onPageChange(page)}
                >
                    {page + 1}
                </li>
            ))}

            {/* 다음으로 */}
            <li
                className={`page-btn ${
                    currentPage === totalPages - 1 ? "disabled" : ""
                }`}
                onClick={
                    currentPage === totalPages - 1
                        ? undefined
                        : () => onPageChange(currentPage + 1)
                }
            >
                {">"}
            </li>
        </ul>
    );
};

export default News;
