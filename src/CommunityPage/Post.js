import {useParams} from "react-router-dom";

const Post = () => {
    const {id} = useParams();

    // TODO: query post data from server by id;

    return (
        <div>
            <h2>게시글 제목</h2>
            <p>게시글 내용</p>
            <p>게시글 id: {id}</p>
        </div>
    );
};

export default Post;