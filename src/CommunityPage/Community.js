import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import "./Community.css";
import CategoryButtons from "./CategoryButtons";


// dummy data
const dummyPosts = Array.from({length:50}, (_, i) => ({
    id: i+1,
    title: `글 제목${i+1}`,
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 50),
    author: `작성자 ${i+1}`,
}));

const POSTS_PER_PAGE = 5;

const CommunityPage = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const offset = currentPage * POSTS_PER_PAGE;
    const currentPosts = dummyPosts.slice(offset,  offset + POSTS_PER_PAGE);

    const handlePageClick = ({selected}) => {
        setCurrentPage(selected);
    };

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
                {currentPosts.map((post) => (
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

            <ReactPaginate 
            previousLabel={"<"}
            nextLabel={">"}
            pageCount={Math.ceil(dummyPosts.length / POSTS_PER_PAGE)}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            pageRangeDisplayed={5}
            marginPagesDisplayed={1}
            />
        </div>
    );
};

export default CommunityPage;
