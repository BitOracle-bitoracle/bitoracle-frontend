import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import axios from "axios";

import "./Post.css";

const BASE_URL = "https://api.bitoracle.shop/api/community";

const Post = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/post/${id}`);
                setPost(res.data.data);
                console.log("Success to get the post.", res.data?.data);
            } catch (error) {
                console.error("Fail to load the post.", error.response.data);
            }
        };

        fetchPost();
    }, [id]);

    if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="post-container">
            <div className="top-main">
                <h2 className="title">{post.title}</h2>
                <div className="info-box">
                    <span className="name-box">{post.writer.nickName}</span>
                    <span className="createdAt">
                        {new Date(post.createdAt).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                        })}
                    </span>
                    <span className="spaceholder" />
                    <Likes id={id} initialCount={post.likeCount}/>
                </div>
            </div>

            <ReactMarkdown className="post-content">
                {post.content}
            </ReactMarkdown>

            {/* <Comments comments={post.replyList} /> */}
        </div>
    );
};

const Likes = ({ id, initialLiked = false, initialCount = 0 }) => {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        // handleLikeClick();
    }, []);

    const handleLikeClick = async () => {
        const token = localStorage.getItem("access");

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/${id}/like`, id, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true, // Cookie 전달함.
            });
            console.log("Success to post likes.", res);

            setLiked(res.data.data.islike);
            setCount(initialCount + res.data.data.likeCount);
            console.log("like count: ", res, res.data.data.likeCount);
        } catch (error) {
            console.error("Fail to post likes.", error);
        }
    };

    return (
        <a
            className={`like-button ${liked ? "liked" : ""}`}
            onClick={handleLikeClick}
        >
            <span>좋아요 </span>
            <span className="count">{count}</span>
            <span className="heart">❤️</span>
        </a>
    );
};

const Comments = ({ comments: initialComments }) => {
    const [comments, setComments] = useState(initialComments || []);
    const [newComment, setNewComment] = useState("");
    const [replyInputs, setReplyInputs] = useState({}); // replyId -> 대댓글 입력 값
    const [openReplyBoxId, setOpenReplyBoxId] = useState(null); // 열려 있는 댓글의 ID

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return; // 빈 댓글 방지

        const newReply = {
            replyId: Date.now(), // 임시로 timestamp를 ID로 사용
            content: newComment,
            writerDto: { nickName: "임시사용자" }, // 임시 작성자
            re_ReplyListDtoList: [],
            removed: false,
        };

        // 댓글 배열에 새 댓글 추가
        setComments((prev) => [newReply, ...prev]);
        setNewComment(""); // 입력창 비우기
    };

    const handleReplyInputChange = (id, value) => {
        setReplyInputs((prev) => ({ ...prev, [id]: value }));
    };

    const handleAddRecomment = (parentId) => {
        const content = replyInputs[parentId];
        if (!content?.trim()) return;

        const newReComment = {
            reCommentId: Date.now(),
            content,
            writerDto: { nickName: "임시대댓글유저" },
            removed: false,
        };

        setComments((prev) =>
            prev.map((comment) =>
                comment.replyId === parentId
                    ? {
                          ...comment,
                          re_ReplyListDtoList: [
                              ...comment.re_ReplyListDtoList,
                              newReComment,
                          ],
                      }
                    : comment
            )
        );

        setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
        setOpenReplyBoxId(null);
    };

    const toggleInputBox = (id) => {
        setOpenReplyBoxId((prev) => (prev === id ? null : id));
    };

    return (
        <div></div>
        // <div className="comments-section">
        //     <h3>댓글 {comments.length}</h3>

        //     <div className="comment-input-box">
        //         <textarea
        //             value={newComment}
        //             onChange={handleCommentChange}
        //             placeholder="댓글을 입력하세요"
        //             rows={3}
        //         />
        //         <button onClick={handleAddComment}>등록</button>
        //     </div>

        //     <ul className="comment-list">
        //         {comments.map((comment) => (
        //             <li key={comment.id} className="comment-item" onClick={() => toggleInputBox(comment.id)}>
        //                 <strong>{comment.author}</strong>
        //                 <p>{comment.content}</p>

        //                 {/* 대댓글 리스트 */}
        //                 {comment.replies.length > 0 && (
        //                     <ul className="reply-list">
        //                         {comment.replies.map((reply) => (
        //                             <li key={reply.id} className="reply-item">
        //                                 <strong>{reply.author}</strong>
        //                                 <p>{reply.content}</p>
        //                             </li>
        //                         ))}
        //                     </ul>
        //                 )}

        //                 {/* 대댓글 입력 */}
        //                 <div className="reply-input-box">
        //                     <textarea
        //                         value={replyInputs[comment.id] || ""}
        //                         onChange={(e) =>
        //                             handleReplyChange(
        //                                 comment.id,
        //                                 e.target.value
        //                             )
        //                         }
        //                         placeholder="대댓글 입력"
        //                         rows={2}
        //                     />
        //                     <button onClick={() => handleAddReply(comment.id)}>
        //                         답글
        //                     </button>
        //                 </div>
        //             </li>
        //         ))}
        //     </ul>
        // </div>
    );
};

function isLogined() {
    const token = localStorage.getItem("access");

    if (!token) {
        alert("로그인이 필요합니다.");
        return false;
    }

    return true;
}

export default Post;
