import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Community.css";
import CategoryButtons from "./CategoryButtons";

// dummy data
const posts = [
    {
        id: 1,
        title: "첫 번째 글의 제목은 매우 길어 생략이 발생합니다.첫 번째 글의 제목은 매우 길어 생략이 발생합니다.첫 번째 글의 제목은 매우 길어 생략이 발생합니다.첫 번째 글의 제목은 매우 길어 생략이 발생합니다.첫 번째 글의 제목은 매우 길어 생략이 발생합니다.",
        author: "홍길동",
        comments: 222223,
        likes: 5,
    },
    { id: 2, title: "두 번째 글", author: "김철수", comments: 1, likes: 2 },
    {
        id: 3,
        title: "세 번째 글",
        author: "이영희",
        comments: 7,
        likes: 10,
    },
    {
        id: 4,
        title: "네 번째 글",
        author: "이영희",
        comments: 7,
        likes: 10,
    },
    {
        id: 5,
        title: "다섯번째 글",
        author: "이영희",
        comments: 7,
        likes: 10,
    },
    {
        id: 6,
        title: "여섯번째 글",
        author: "이영희",
        comments: 7,
        likes: 10,
    },
];

const CommunityPage = () => {
    const navigate = useNavigate();

    return (
        <div className="community-container">
            <div>
                <h1>커뮤니티 페이지</h1>
                <h4>당신의 생각을 공유해보세요.</h4>
            </div>

            <div className="top-bar">
                <CategoryButtons onCategoryChange={``} />
                <input type="text" className="search-input" />
                <select className="select" />
            </div>

            <button className="write-button" onClick={() => navigate("/community/write")}>+</button>

            <div className="post-items">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="post-item"
                        onClick={() => navigate(`/community/post/${post.id}`)}
                    >
                        <span className="post-title">{post.title}</span>
                        <span className="post-other">좋아요{post.likes}</span>
                        <span className="post-other">댓글{post.comments}</span>
                        <span className="post-other">{post.author}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunityPage;
