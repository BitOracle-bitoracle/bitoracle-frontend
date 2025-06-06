import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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

    const handleAddLike = async () => {
        // 클릭 시 서버에서 like:true or false 반환. 즉 클릭 시 현재 값의 역 값을 전달하면 됨.
        await axios.post();
    };

    useEffect(() => {
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
                    <span onClick={handleAddLike}>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                </div>
            </div>
            <p className="post-content">{post.content}</p>

            <Comments />
        </div>
    );
};

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({}); // {1: "대댓글1", 2: "대댓글2"}

  const handleCommentChange = (e) => setNewComment(e.target.value);

  const handleAddComment = () => {
    if (newComment.trim() === "") return;

    const newId = Date.now();
    const newCommentObj = {
      id: newId,
      author: "현재 사용자",
      content: newComment,
      replies: []
    };

    setComments([...comments, newCommentObj]);
    setNewComment("");
  };

  const handleReplyChange = (commentId, value) => {
    setReplyInputs({ ...replyInputs, [commentId]: value });
  };

  const handleAddReply = (commentId) => {
    const replyText = replyInputs[commentId];
    if (!replyText || replyText.trim() === "") return;

    const newReply = {
      id: Date.now(),
      author: "현재 사용자",
      content: replyText
    };

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      )
    );

    setReplyInputs({ ...replyInputs, [commentId]: "" });
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
            <p>{comment.content}</p>

            {/* 대댓글 리스트 */}
            {comment.replies.length > 0 && (
              <ul className="reply-list">
                {comment.replies.map((reply) => (
                  <li key={reply.id} className="reply-item">
                    <strong>{reply.author}</strong>
                    <p>{reply.content}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* 대댓글 입력 */}
            <div className="reply-input-box">
              <textarea
                value={replyInputs[comment.id] || ""}
                onChange={(e) =>
                  handleReplyChange(comment.id, e.target.value)
                }
                placeholder="대댓글 입력"
                rows={2}
              />
              <button onClick={() => handleAddReply(comment.id)}>답글</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};


export default Post;
