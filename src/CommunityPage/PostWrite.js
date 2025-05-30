import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/toastui-editor.css";
import color from "@toast-ui/editor-plugin-color-syntax";
import "tui-color-picker/dist/tui-color-picker.css";
import "@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css";

import "./PostWrite.css";

const BASE_URL = "https://api.bitoracle.shop/api/community";

const PostWrite = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [title, setTitle] = useState("");

    // const handleImageUpload = async (blob, callback) => {
    //     try {
    //         const formData = new FormData();
    //         formData.append("image", blob);
    //         const response = await axios.post("/api/upload", formData, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //             },
    //         });
    //         const imageUrl = response.data.url; // 서버에서 반환한 이미지 URL
    //         callback(imageUrl, ""); // 두 번째 인자는 alt 텍스트
    //     } catch (error) {
    //         console.error("Fail to upload an image: ", error);
    //     }
    // };

    const handleSubmit = async () => {
        const content = editorRef.current.getInstance().getHTML();
        const postData = {
            title: title,
            content: content, // 또는 getMarkdown()
            postType: "NORMAL",
        };

        if (title.trim().length < 5) {
            alert("제목을 다섯 자 이상 작성해주세요.");
            return;
        }

        if (content.trim().length < 5) {
            alert("본문을 다섯 자 이상 작성해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("postSaveDto", new Blob([JSON.stringify(postData)], {type: "application/json"}));

        try {
            const res = await axios.post(`${BASE_URL}/post`, formData);
            console.log("Success to post: ", res.data);
            navigate(`/community/post/${res.data.id}`);
        } catch (error) {
            console.error(`Fail to post: ${postData}\n`, error);
        }
    };

    return (
        <div className="write-container">
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
                // hooks={{     // TODO: 활성화 시 image 업로드 안되는 현상 발생. axios POST 문제인지 hooks 자체의 문제인지 파악.
                //     addImageBlobHook: handleImageUpload,
                // }}
            />

            <button onClick={handleSubmit} className="submit-btn">
                작성 완료
            </button>
        </div>
    );
};

export default PostWrite;
