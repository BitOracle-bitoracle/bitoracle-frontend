import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/toastui-editor.css";
import color from "@toast-ui/editor-plugin-color-syntax";
import "tui-color-picker/dist/tui-color-picker.css";
import "@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css";

import "./PostWrite.css";

const BASE_URL = "http://3.36.74.196:8080/api/community";

const PostWrite = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [title, setTitle] = useState("");
    const [imageFileList, setImageFileList] = useState([]);

    return (
        <div className="write-container">
            <div className="write-content">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="title-input"
            />

            <Editor
                previewStyle="vertical"
                height="600px"
                initialEditType="wysiwyg"
                useCommandShortcut={false}
                hideModeSwitch={true}
                ref={editorRef}
                plugins={[color]}
                hooks={{
                    addImageBlobHook: handleImageUpload,
                }}
            />

            <button
                onClick={() => handleSubmitBtnClick(navigate, editorRef, title)}
                className="submit-btn"
            >
                작성 완료
            </button>
            </div>
        </div>
    );
};

async function handleImageUpload(blob, callback) {
    const token = localStorage.getItem("access");

    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("image", blob);
        const res = await axios.post(
            `${BASE_URL}/post/image/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`, // Access token을 header로 전달함.
                },
                withCredentials: true, // Cookie 전달함.
            }
        );

        console.log("Sucess to post image: ", res.data.data);
        const imageUrl = res.data.data;
        callback(imageUrl, "");  // Second parameter is alt.
    } catch (error) {
        console.error("Fail to upload an image: ", error.response.data);
    }
}

async function handleSubmitBtnClick(navigate, editorRef, title) {
    const token = localStorage.getItem("access");
    const content = editorRef.current.getInstance().getMarkdown();
    const postData = {
        title: title,
        content: content,
    };
    const formData = new FormData();

    if (title.trim().length < 5) {
        alert("제목을 다섯 자 이상 작성해주세요.");
        return;
    }

    if (content.trim().length < 5) {
        alert("본문을 다섯 자 이상 작성해주세요.");
        return;
    }

    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    formData.append(
        "post",
        new Blob([JSON.stringify(postData)], { type: "application/json" }),
        "post.json"
    );
    console.log("Trying to post...\n", postData);

    try {
        const res = await axios.post(`${BASE_URL}/post`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`, // Access token을 header로 전달함.
            },
            withCredentials: true, // Cookie 전달함.
        });

        alert("게시글이 등록되었습니다.");
        console.log("Success to post: ", res.data);
        navigate(`/community/post/${res.data.data.id}`);
    } catch (error) {
        console.error("Fail to post\n", error.response.data);
    }
}

export default PostWrite;
