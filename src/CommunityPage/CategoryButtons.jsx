import React, { useState } from "react";
import "./Community.css";

const CategoryButtons = ({ onCategoryChange }) => {
    const [activeCategory, setActiveCategory] = useState("전체글");

    const categories = ["전체글", "인기글", "칼럼"];

    const handleCategoryButtonClick = (category) => {
        setActiveCategory(category);
        // onCategoryChange(category);
    };

    return (
        <div className="category-buttons">
            {categories.map((category) => (
                <button
                    key={category}
                    className={`category-button ${
                        activeCategory === category ? "active" : ""
                    }`}
                    onClick={() => handleCategoryButtonClick(category)}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default CategoryButtons;