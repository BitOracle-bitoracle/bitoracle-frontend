import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./News.css";

// 05-10
// TODO 페이지네이션 위치 고정하기
// TODO 요약글 대신 날짜 우측 정렬로 추가

const BASE_URL = "https://api.bitoracle.shop/api/news";
const NEWS_PER_PAGE = 10;
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// 더미 데이터 (로컬 환경용)
const dummyTopic = "비트코인";
const dummyGoodNews = [
    { news_title: "비트코인 ETF 승인으로 기관 투자자 유입 증가", news_url: "https://example.com/news1", created_at: new Date().toISOString() },
    { news_title: "이더리움 2.0 업그레이드 성공적으로 완료", news_url: "https://example.com/news2", created_at: new Date(Date.now() - 86400000).toISOString() },
    { news_title: "대형 은행, 암호화폐 보관 서비스 출시", news_url: "https://example.com/news3", created_at: new Date(Date.now() - 172800000).toISOString() },
    { news_title: "암호화폐 시장 총 시가총액 3조 달러 돌파", news_url: "https://example.com/news4", created_at: new Date(Date.now() - 259200000).toISOString() },
    { news_title: "NFT 시장 급성장, 디지털 아트 거래량 급증", news_url: "https://example.com/news5", created_at: new Date(Date.now() - 345600000).toISOString() },
    { news_title: "디파이 프로토콜, 전통 금융과 협력 확대", news_url: "https://example.com/news6", created_at: new Date(Date.now() - 432000000).toISOString() },
    { news_title: "블록체인 기술, 공급망 관리 분야 도입 확산", news_url: "https://example.com/news7", created_at: new Date(Date.now() - 518400000).toISOString() },
    { news_title: "암호화폐 결제 시스템, 전 세계 유통업체 도입", news_url: "https://example.com/news8", created_at: new Date(Date.now() - 604800000).toISOString() }
];
const dummyBadNews = [
    { news_title: "암호화폐 규제 강화 움직임, 시장 불안감 증가", news_url: "https://example.com/bad1", created_at: new Date().toISOString() },
    { news_title: "대규모 해킹 사건으로 암호화폐 거래소 신뢰도 하락", news_url: "https://example.com/bad2", created_at: new Date(Date.now() - 86400000).toISOString() },
    { news_title: "중국 암호화폐 거래 금지 조치 재확인", news_url: "https://example.com/bad3", created_at: new Date(Date.now() - 172800000).toISOString() },
    { news_title: "암호화폐 시장 변동성 심화, 투자자 우려", news_url: "https://example.com/bad4", created_at: new Date(Date.now() - 259200000).toISOString() },
    { news_title: "환경 문제로 비트코인 채굴 규제 논의", news_url: "https://example.com/bad5", created_at: new Date(Date.now() - 345600000).toISOString() },
    { news_title: "스캠 프로젝트 증가로 투자자 피해 확산", news_url: "https://example.com/bad6", created_at: new Date(Date.now() - 432000000).toISOString() },
    { news_title: "암호화폐 세금 부담 증가, 거래자 부담 가중", news_url: "https://example.com/bad7", created_at: new Date(Date.now() - 518400000).toISOString() },
    { news_title: "중앙은행, 암호화폐 거래 제한 검토", news_url: "https://example.com/bad8", created_at: new Date(Date.now() - 604800000).toISOString() }
];

const News = () => {
    const [topic, setTopic] = useState("bitcoin");

    const [goodCurPage, setGoodCurPage] = useState(0);
    const [goodTotalPages, setGoodTotalPages] = useState(0);
    const [goodNews, setGoodNews] = useState([]);

    const [badCurPage, setBadCurPage] = useState(0);
    const [badTotalPages, setBadTotalPages] = useState(0);
    const [badNews, setBadNews] = useState([]);

    useEffect(() => {
        if (isLocalhost) {
            setTopic(dummyTopic);
        } else {
            fetchTopic(setTopic);
        }
    }, []);

    useEffect(() => {
        if (isLocalhost) {
            const startIndex = goodCurPage * NEWS_PER_PAGE;
            const endIndex = startIndex + NEWS_PER_PAGE;
            const paginatedNews = dummyGoodNews.slice(startIndex, endIndex);
            setGoodNews(paginatedNews);
            setGoodTotalPages(Math.ceil(dummyGoodNews.length / NEWS_PER_PAGE));
        } else {
            fetchGoodNews(setGoodCurPage, setGoodTotalPages, setGoodNews, {
                page: goodCurPage,
                size: NEWS_PER_PAGE,
            });
        }
    }, [goodCurPage]);

    useEffect(() => {
        if (isLocalhost) {
            const startIndex = badCurPage * NEWS_PER_PAGE;
            const endIndex = startIndex + NEWS_PER_PAGE;
            const paginatedNews = dummyBadNews.slice(startIndex, endIndex);
            setBadNews(paginatedNews);
            setBadTotalPages(Math.ceil(dummyBadNews.length / NEWS_PER_PAGE));
        } else {
            fetchBadNews(setBadCurPage, setBadTotalPages, setBadNews, {
                page: badCurPage,
                size: NEWS_PER_PAGE,
            });
        }
    }, [badCurPage]);

    return (
        <div className="news-container">
            <div className="news-content">
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
                    <h3 className="news-section-title">호재</h3>
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
                    <h3 className="news-section-title">악재</h3>
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
        const res = await axios.get(`${BASE_URL}/goodNews`, { params });
        console.log("Success to get good news.\n", res, { params });

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
        const res = await axios.get(`${BASE_URL}/badNews`, { params });
        console.log("Success to get bad news.\n", res, { params });

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
