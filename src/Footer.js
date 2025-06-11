import React from "react";
import "./Footer.css";

const Footer = () => {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <footer className="site-footer">
            <div className="footer-container">
                {/* 상단 링크 */}
                <div className="footer-top">
                <div className="footer-section">
                    <strong>Partners</strong>
                    <ul>
                        <li><a href="https://upbit.com" target="_blank" rel="noreferrer">Upbit</a></li>
                        <li><a href="https://binance.com" target="_blank" rel="noreferrer">Binance</a></li>
                        <li><a href="https://coinmarketcap.com" target="_blank" rel="noreferrer">CoinMarketCap</a></li>
                        <li><a href="https://coingecko.com" target="_blank" rel="noreferrer">CoinGecko</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <strong>Developers</strong>
                    <ul>
                        <li><a href="https://github.com/BitOracle-bitoracle" target="_blank" rel="noreferrer">GitHub Repo</a></li>
                        <li><a href="https://coherent-sound-67a.notion.site/BitOracle-1ae89ee9697780228c6aff8083da92f3" target="_self">Collab docs</a></li>
                        {/* <li><a href="/sdk" target="_self">JavaScript SDK</a></li> */}
                        <li><a href="/community" target="_self">Community</a></li>
                    </ul>
                    </div>
                </div>

                {/* 하단 회사 정보 */}
                <div className="footer-bottom">
                    <div className="company-info">
                        <p>BitOracle Inc.</p>
                        <p>서울시 동작구 상도로 369 숭실대학교</p>
                        <p>COPYRIGHT © 2025 BITORACLE INC. ALL RIGHTS RESERVED.</p>
                    </div>
                    <div className="related-site">
                        :: 관련사이트
                        <a href="https://ssu.ac.kr" target="_blank" rel="noreferrer">숭실대학교</a>
                    </div>
                </div>
            </div>

            {/* 우측 하단 버튼들 */}
            <button className="footer-btn-icon top-btn" onClick={scrollToTop}>↑</button>
        </footer>
    );
};

export default Footer;