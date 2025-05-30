import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "./Community.css";

// dummy data
const dummyPosts = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `글 제목${i + 1}`,
    likes: i + 1,
    comments: i + 2,
    author: `작성자 ${i + 1}`,
}));

const dummyPopular = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `인기글${i + 1}`,
    likes: i + 2000,
    comments: i + 100,
    author: `작성자 ${i + 1}`,
}));

const dummyColumn = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `칼럼글${i + 1}`,
    likes: i + 1,
    comments: i + 2,
    author: `작성자 ${i + 1}`,
}));

const CATEGORIES = ["전체글", "인기글", "칼럼"];
const POSTS_PER_PAGE = 4;
const BASE_URL = "https://api.bitoracle.shop/api/community";

/*
    Re-rendering must happen on each steps.
    1. get axios by category.
    2. sort by cur page.
    3. if searching words, get axios.
*/
const CommunityPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Category
    const [category, setCategory] = useState(CATEGORIES[0]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [numOfTotalPages, setNumOfTotalPages] = useState(0);
    const [posts, setPosts] = useState([]); // Information array of posts on current page.

    // Search
    const [searchTerm, setSearchTerm] = useState("");
    const [searchOption, setSearchOption] = useState("title");
    const fetchSearchedPosts = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/search`, {
                params: {
                    page: currentPage,
                    option: searchOption,
                    keyword: searchTerm,
                }
            });
            } catch (error) {
                console.error("Fail to search.\n", error);
            }
    };

    // Get the current page index from URL(it`s so helpful for SEO).
    useEffect(() => {
        getCurrentPageByUrl(location.search, numOfTotalPages, setCurrentPage);
    }, [location, numOfTotalPages]);

    // Get posts against each category.
    useEffect(() => {
        const res = getPosts(category, {
            page: currentPage,
            size: POSTS_PER_PAGE,
        });
        console.log(res);
        setCurrentPage(0);
        setPosts(res.data);
        setNumOfTotalPages(res?.data?.totalPages ?? 0); // ISSUE: response.totalPages is valid value?
    }, [category, currentPage]);

    return (
        <div className="community-container">
            <div>
                <h1>커뮤니티 페이지</h1>
                <h4>당신의 생각을 공유해보세요.</h4>
            </div>

            <div className="top-bar">
                <CategoryButtons
                    current={category}
                    categories={CATEGORIES}
                    onCategoryChange={setCategory}
                />
                <input
                    type="text"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            console.log("Search: ", e.target.value);
                            fetchSearchedPosts();
                        }
                    }}
                    placeholder="검색"
                />
                <select
                    className="search-select"
                    value={searchOption}
                    onChange={(e) => setSearchOption(e.target.value)}
                >
                    <option value="title">제목</option>
                    <option value="author">작성자</option>
                </select>
            </div>

            <button
                className="write-button"
                onClick={() => navigate("/community/write")}
            >
                +
            </button>

            {category === CATEGORIES[2] ? (
                <div className="post-cards">
                    {posts?.map((post) => (
                        <div
                            key={post.id}
                            className="post-card"
                            onClick={() =>
                                navigate(`/community/post/${post.id}`)
                            }
                        >
                            <img
                                src={post.thumbnail}
                                alt="thumbnail"
                                className="post-card-thumbnail"
                            />
                            <span className="post-card-title">
                                {post.title}
                            </span>
                            <span className="post-card-other">
                                {post.author}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="post-lists">
                    <div className="post-index">
                        <span className="post-list-title">제목</span>
                        <span className="post-list-other">좋아요</span>
                        <span className="post-list-other">댓글</span>
                        <span className="post-list-other">작성자</span>
                    </div>
                    {posts?.map((post) => (
                        <div
                            key={post.id}
                            className="post-list"
                            onClick={() =>
                                navigate(`/community/post/${post.id}`)
                            }
                        >
                            <span className="post-list-title">
                                {post.title}
                            </span>
                            <span className="post-list-other">
                                {post.likes}
                            </span>
                            <span className="post-list-other">
                                {post.comments}
                            </span>
                            <span className="post-list-other">
                                {post.author}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <CustomPagination
                currentPage={currentPage}
                totalPages={numOfTotalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

function getCurrentPageByUrl(locationSearch, numOfTotalPages, setCurrentPage) {
    const queryParams = new URLSearchParams(locationSearch);
    const page = parseInt(queryParams.get("page"), 10);
    if (page && page >= 1 && page <= numOfTotalPages) {
        setCurrentPage(page - 1);
    } else {
        setCurrentPage(0);
    }
}

async function getPosts(category, params) {
    let res;

    try {
        switch (category) {
            case CATEGORIES[0]:
                res = await axios.get(`${BASE_URL}`, { params });
                break;
            case CATEGORIES[1]:
                res = await axios.get(`${BASE_URL}/popular`, { params });
                break;
            case CATEGORIES[2]:
                res = await axios.get(`${BASE_URL}/column`, { params });
                break;
            default:
                res = await axios.get(`${BASE_URL}`, { params });
        }

        return res;
    } catch (error) {
        console.error("Fail to get posts.\n", error);
    }

    return null;
}

const CategoryButtons = ({ current, categories, onCategoryChange }) => {
    return (
        <div className="category-buttons">
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`category-button ${
                        cat === current ? "active" : ""
                    }`}
                    onClick={() => onCategoryChange(cat)}
                >
                    {cat}
                </button>
            ))}
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

export default CommunityPage;
