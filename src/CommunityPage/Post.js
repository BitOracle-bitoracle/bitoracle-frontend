import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import axios from "axios";

import "./Post.css";

// dummy
const dummyPosts = Array.from({ length: 50 }, (_, i) => ({
    id: (i + 1).toString(),
    title: `글 제목 ${i + 1}`,
    content: `이것은 글 ${i + 1}의 본문 내용입니다. \n안녕하세요.\n좋은 아침입니다.\n이제 점심시간입니다.\n저녁이 지나갔습니다.\n잘 자요.`,
    author: `작성자 ${i + 1}`,
    likes: i + 1,
    comments: i + 2,
}));

const dummyComments = [
    { id: 1, author: "user1", content: "좋은 글이네요!", createdAt: "2024-12-01" },
    { id: 2, author: "user2", content: "감사합니다!", createdAt: "2024-12-02" },
];

const Post = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        // axios.get('')
        // .then()
        // .catch()

        // test
        const found = dummyPosts.find((p) => p.id === id);
        setPost(found);
    }, [id]);

    if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="post-container">
            <div className="top-main">
                <h1 className="title">{post.title}</h1>
                <div className="info-box">
                    <strong className="name-box">{post.author}</strong>
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                </div>
            </div>
            <p className="post-content">{post.content}</p>

            <Likes />
            <Comments />
        </div>
    );
};

const Likes = () => {

    //TODO 서버에 좋아요 수 POST. 새 정보는 WebSocket 연결로 GET.

}

const Comments = () => {
    const [comments, setComments] = useState(dummyComments);
    const [newComment, setNewComment] = useState("");

    //TODO 서버에 새 댓글, 댓글 수 POST. 새 정보는 WebSocket 연결로 GET.

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleAddComment = () => {
        if (newComment.trim() === "") return;

        const newId = comments.length + 1;
        const newCommentObj = {
            id: newId,
            author: "현재 사용자",
            content: newComment,
        };

        setComments([...comments, newCommentObj]);
        setNewComment("");
    };

    return (
        <div className="comments-section">
            <h3>댓글 {comments.length}</h3>

            <div className="comment-input-box">
                <textarea
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="댓글을 입력하세요"
                    rows={3}
                />
                <button onClick={handleAddComment}>등록</button>
            </div>

            <ul className="comment-list">
                {comments.map((comment) => (
                    <li key={comment.id} className="comment-item">
                        <strong>{comment.author}</strong>
                        <span>{comment.content}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Post;
