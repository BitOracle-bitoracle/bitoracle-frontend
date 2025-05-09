import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./News.css";

// Dummy
const goodNewsData = [
    { id: 1, title: "비트코인 ETF 승인으로 가격 급등 기대", link:"https://www.naver.com/" },
    { id: 2, title: "이더리움 업그레이드 성공…속도·보안 향상" },
    { id: 3, title: "국제 투자은행, 암호화폐 시장 진출 선언" },
    { id: 4, title: "미국 CPI 둔화로 위험자산 선호 상승" },
    { id: 5, title: "삼성전자, 자체 블록체인 개발 본격화" },
    { id: 6, title: "정부, 디지털 자산 육성 정책 발표" },
    { id: 7, title: "테슬라, 비트코인 보유 재개…시장 반응 호재" },
    { id: 8, title: "세계 최대 해지펀드, 암호화폐 투자 본격화" },
    { id: 9, title: "이더리움 수수료 급감, 사용자 부담 완화" },
    { id: 10, title: "아마존, 블록체인 기반 결제 시스템 도입" },
    { id: 11, title: "블록체인 특허 급증…산업 성장세 반영" },
    { id: 12, title: "금융위, 암호화폐 제도권 편입 시사" },
    { id: 13, title: "비자·마스터카드, 암호화폐 결제망 확대" },
    { id: 14, title: "AI 기술 접목한 트레이딩 봇 수익률 증가" },
    { id: 15, title: "전 세계 중앙은행, CBDC 실험 가속화" },
    { id: 16, title: "국내 거래소, 글로벌 진출 본격 시동" },
    { id: 17, title: "IMF, 암호화폐 긍정적 규제 방향 제시" },
    { id: 18, title: "채굴 친환경화 성공…기관투자자 관심 증가" },
    { id: 19, title: "NFT, 다시 투자자 관심 집중" },
    { id: 20, title: "대형 기업 암호화폐 결제 수단 채택 확산" },
];

const badNewsData = [
    { id: 1, title: "SEC, 주요 코인 증권 분류 추진…시장 혼란" },
    { id: 2, title: "비트코인 가격 급락…대규모 매도 발생" },
    { id: 3, title: "거래소 해킹 피해…수천억 규모 손실" },
    { id: 4, title: "암호화폐 과세 강화 방안 발표" },
    { id: 5, title: "미국 금리 인상 우려에 위험자산 매도 증가" },
    { id: 6, title: "테라 사태 여파 지속…투자심리 위축" },
    { id: 7, title: "중국, 암호화폐 전면 금지 조치 발표" },
    { id: 8, title: "바이낸스, 규제 위반 혐의로 벌금 부과" },
    { id: 9, title: "해외 주요 거래소, 출금 중단 사태 발생" },
    { id: 10, title: "사기 ICO 급증…투자자 주의 요구" },
    { id: 11, title: "FBI, 암호화폐 관련 범죄 수사 본격화" },
    { id: 12, title: "루나 가격 폭락 후 재상장 논란" },
    { id: 13, title: "대형 해커 집단, 암호화폐 대상 공격 예고" },
    { id: 14, title: "은행, 암호화폐 연동 계좌 서비스 중단" },
    { id: 15, title: "거래소 유동성 위기설 확산" },
    { id: 16, title: "거래소 내부자 거래 의혹으로 수사 착수" },
    { id: 17, title: "세계 경기 침체 우려로 투자심리 위축" },
    { id: 18, title: "채굴 난이도 상승으로 소규모 채굴자 철수" },
    { id: 19, title: "신규 규제 도입으로 거래량 급감" },
    { id: 20, title: "스테이블코인 페깅 실패 사례 확산" },
];

const News = () => {
    const [topic, setTopic] = useState("bitcoin");
    const [goodPage, setGoodPage] = useState(0);
    const [badPage, setBadPage] = useState(0);
    const ITEMS_PER_PAGE = 5;

    const slicedGoodPage = goodNewsData.slice(
        goodPage * ITEMS_PER_PAGE,
        (goodPage + 1) * ITEMS_PER_PAGE
    );

    const slicedBadPage = badNewsData.slice(
        badPage * ITEMS_PER_PAGE,
        (badPage + 1) * ITEMS_PER_PAGE
    );

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
                    {slicedGoodPage.map((news) => (
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
                        currentPage={goodPage}
                        totalPages={Math.ceil(
                            goodNewsData.length / ITEMS_PER_PAGE
                        )}
                        onPageChange={setGoodPage}
                    />
                </div>

                <div className="bad_news-items">
                    {slicedBadPage.map((news) => (
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
                        currentPage={badPage}
                        totalPages={Math.ceil(
                            badNewsData.length / ITEMS_PER_PAGE
                        )}
                        onPageChange={setBadPage}
                    />
                </div>
            </div>
        </div>
    );
};

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
