/*
    Re-rendering must happen on each steps.
    1. get axios by category.
    2. sort by cur page.
    3. if searching words, get axios.
*/
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "./Community.css";

const CATEGORIES = ["전체글", "인기글", "칼럼글"];
const POSTS_PER_PAGE = 20;
const BASE_URL = "http://3.36.74.196:8080/api/community";

const CommunityPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [category, setCategory] = useState(CATEGORIES[0]);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [posts, setPosts] = useState([]); // Information array of posts on current page.

    const [searchTerm, setSearchTerm] = useState("");
    const [searchOption, setSearchOption] = useState("title");
    const fetchSearchedPosts = async () => {
        //ISSUE: 가져오는 글 like 0, 백엔드 문제.
        try {
            const res = await axios.get(`${BASE_URL}/search`, {
                params: {
                    page: 0,
                    size: POSTS_PER_PAGE,
                    // author: searchTerm,
                    title: searchTerm,
                },
            });
            // TODO: 검색 시 navigate() -> urlSearchParams() -> query 작성해서 get 날리기. 
            setPosts(res?.data?.data?.simpleLectureDtoList ?? []);
            setTotalPages(res?.data?.data?.totalPages ?? 0);
            console.log(`Sucess to get posts.`, res.data.data.simpleLectureDtoList);
        } catch (error) {
            console.error("Fail to search.\n", error);
        }
    };

    // Modify the URLParam and then set values(it`s so helpful for SEO).
    useEffect(async () => {
        const queryParams = new URLSearchParams(location.search);
        let page = parseInt(queryParams.get("page"), 10);
        page = isNaN(page) || page <= 0? 0 : page-1;
        const category = queryParams.get("category");

        setCurrentPage(page);
        setCategory(CATEGORIES.includes(category) ? category : CATEGORIES[0]);

        const res = await getPosts(category, {
            page: page,
            size: POSTS_PER_PAGE,
        });
        setPosts(res?.data?.data?.content ?? []);
        setTotalPages(res?.data?.data?.totalPages ?? 0);
    }, [location.search]);

    return (
        <div className="community-container">
            <div className="community-content">
            <div>
                <h1>커뮤니티 페이지</h1>
                <h4>당신의 생각을 공유해보세요.</h4>
            </div>

            <div className="top-bar">
                <div className="left-placeholder" />
                <CategoryButtons
                    current={category}
                    categories={CATEGORIES}
                    onCategoryChange={(cat) => {
                        navigate(`/community?category=${cat}&page=1`);
                    }}
                />
                <input
                    type="text"
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            console.log("Search Term: ", e.target.value);
                            fetchSearchedPosts();
                        }
                    }}
                    placeholder="검색"
                />
                {/* <select
                    className="search-select"
                    value={searchOption}
                    onChange={(e) => setSearchOption(e.target.value)}
                >
                    <option value="title">제목</option>
                    <option value="author">작성자</option>
                </select> */}
            </div>

            <button
                className="write-button"
                onClick={() => handleWriteBtnClick(navigate)}
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
                                src={post.thumbnailUrl}
                                alt="thumbnail"
                                className="post-card-thumbnail"
                            />
                            <span className="post-card-title">
                                {post.title}
                            </span>
                            <span className="post-card-other">
                                {post.writer}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="post-lists">
                    <div className="post-index">
                        <span className="post-list-title">제목</span>
                        <span className="post-list-other">좋아요</span>
                        {/* <span className="post-list-other">댓글</span> */}
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
                                {post.likeCount}
                            </span>
                            {/* <span className="post-list-other">
                                {post.replyCount}
                            </span> */}
                            <span className="post-list-other">
                                {post.writer}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    navigate(
                        `/community?category=${category}&page=${page + 1}`
                    );
                }}
                />
                </div>
        </div>
    );
};

async function handleWriteBtnClick(navigate) {
    const token = localStorage.getItem("access");

    if (token) {
        navigate("/community/write");
    } else {
        alert("로그인이 필요합니다.");
        return;
    }
}

async function getPosts(category, params) {
    let res = null;

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

        console.log(`Sucess to get ${category} posts.`, res.data.data);
    } catch (error) {
        console.error("Fail to get posts.\n", error);
    }

    return res;
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

export default CommunityPage;
