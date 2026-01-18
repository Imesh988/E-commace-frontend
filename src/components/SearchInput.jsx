import React from "react";
import {CiSearch} from "react-icons/ci";

const SearchInput = ({value , onchange , placeholder = "Search Here ..."}) => {
    return (
        <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex
            items-center pointer-events-none">
                <CiSearch className="h-5 w-5 text-gray-500 font-bold"/>
            </div>

            <input 
            type="text" 
            value={value} 
            onChange={onchange} 
            placeholder={placeholder}
            className="block w-full pl-12 pr-4 py-3 bg-white/60 
            border border-emerald-100 rounded-2xl outline-none 
            focus:ring-2 focus:ring-emerald-500 backdrop-blur-md 
            transition-all text-gray-700 placeholder:text-gray-400 shadow-sm"/>
        </div>
    )
}


export default SearchInput;