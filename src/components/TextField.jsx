import React from 'react'

const TextField = ({label , type , name , value , onChange , placeholder , required = false}) => {
    return (
       <div className="flex flex-col w-full mb-4">
            <label className="text-xs font-semibold text-gray-400 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full py-2 bg-transparent border-b border-gray-200 focus:border-emerald-500 outline-none transition-all"
            />
        </div>
    )
}

export default TextField