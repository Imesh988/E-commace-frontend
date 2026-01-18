import React from "react";

const Button = ({ title, onClick, variant = "primary", icon, type = "submit" }) => {
    const styles = {
        primary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200",
        outline: "border border-gray-300 text-gray-500 hover:bg-gray-50",
        warning: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-100"
    };

    return (
        <button
            type={type} 
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all active:scale-95 ${styles[variant]}`}
        >
            {icon && <span>{icon}</span>}
            {title}
        </button>
    );
};

export default Button