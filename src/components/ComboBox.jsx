import React from "react";

const ComboBox = ({label , name , value , onChange , options , placeholder ,
     require = false , error , ...props}) => {
        return (
             <div className="flex flex-col w-full mb-4">
            <label className="text-xs font-semibold text-gray-400 mb-1">{label}</label>
            
            <select
                name={name}
                value={value || ""}
                onChange={onChange}
                required={require}
                className="w-full py-2 bg-transparent border-b border-gray-200 focus:border-emerald-500 outline-none transition-all cursor-pointer text-gray-700 appearance-none"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }} 
                {...props}
            >
                <option value="" disabled className="text-gray-400">
                    {placeholder || "Select an option"}
                </option>

                {options && options.map((option, index) => (
                    <option key={index} value={option.value} className="text-black">
                        {option.label}
                    </option>
                ))}
            </select>

            {error && <span className="text-[10px] text-red-500 mt-1">{error}</span>}
        </div>
        )
     }

     export default ComboBox;