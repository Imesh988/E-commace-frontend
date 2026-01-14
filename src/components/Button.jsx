import React from "react";

const Button = ({ title, onClick, variant = "primary", icon }) => {
    const styles = {
        primary: "bg-emerald-500 hover:bg-emerald-600 text-white",
        outline: "border border-gray-300 text-gray-500 hover:bg-gray-50"
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all ${styles[variant]}`}
        >
            {icon && <span>{icon}</span>}
            {title}
        </button>
    );
};

export default Button