import React from 'react'

const TextField = ({label , type , name , value , onChange , placeholder , required = false , error, ...props}) => {
    return (
       <div className="flex flex-col w-full mb-4">
            <label className="text-xs font-semibold text-gray-400 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                  className={`w-full py-2 bg-transparent border-b outline-none transition-all ${
                    props.disabled 
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed italic'
                    : 'border-gray-200 focus:border-emerald-500 text-gray-700'  
                }`}
                {...props}
            />
            {error && <span className="text-[10px] text-red-500 mt-1">{error}</span>}
        </div>
    )
}

export default TextField;