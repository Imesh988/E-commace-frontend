import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiLogOut, BiLogIn, BiUser, BiSearch } from "react-icons/bi";
import { FaUserPlus, FaShoppingBag } from "react-icons/fa";
import { MdCategory, MdDashboard, MdOutlineShoppingCart } from 'react-icons/md';
import { ChevronDownIcon } from "lucide-react";

import SearchInput from "../components/SearchInput";
import { categoryAPI } from "../services/api";

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    const [searchTerm, setSearchTerm] = useState("");
    const [categories, setCategories] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("All Categories");
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const currentSearchInUrl = queryParams.get('search') || '';
        const currentCategoryInUrl = queryParams.get('category') || '';
        setSearchTerm(currentSearchInUrl);

        if (currentCategoryInUrl) {
            setSelectedCategoryLabel(currentCategoryInUrl);
        } else {
            setSelectedCategoryLabel("All Categories");
        }
    }, [location.search]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryAPI.getAllCategory();
            const data = res.data && res.data.data ? res.data.data : [];
            setCategories(data);
        } catch (error) {
            console.error("Category Load Failed", error);
            setCategories([]);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        const queryParams = new URLSearchParams(location.search);
        if (value.trim()) {
            queryParams.set('search', value.trim());
        } else {
            queryParams.delete('search');
        }
        navigate(`/?${queryParams.toString()}`);
    };

    const handleCategorySelect = (categoryName) => {
        setSelectedCategoryLabel(categoryName);
        setShowCategoryDropdown(false);

        const queryParams = new URLSearchParams(location.search);
        if (categoryName !== "All Categories") {
            queryParams.set('category', categoryName);
        } else {
            queryParams.delete('category');
        }
        navigate(`/?${queryParams.toString()}`);
    };

    const navBtnStyle = `
        group relative flex items-center gap-2 px-5 py-2.5 rounded-xl
        text-gray-700 font-semibold text-sm transition-all duration-300
        hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50
        hover:text-amber-700 hover:shadow-lg hover:shadow-amber-100
        active:scale-95 overflow-hidden
    `;

    const iconBoxStyle = `
        p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:scale-110
        transition-all duration-300 shadow-sm
    `;

    return (
        <nav className={`sticky top-4 z-50 px-4 transition-all duration-500 ${isScrolled ? 'pt-2' : 'pt-0'}`}>
            <div className={`
                max-w-7xl mx-auto
                bg-white/90 backdrop-blur-xl
                border border-gray-200/50
                shadow-[0_8px_32px_rgba(0,0,0,0.08)]
                rounded-2xl
                px-6 sm:px-8
                transition-all duration-500
                ${isScrolled ? 'shadow-xl bg-white/95' : ''}
            `}>
                <div className="flex justify-between items-center h-20">

                    <div
                        className="flex-shrink-0 flex items-center gap-3 group cursor-pointer"
                        onClick={() => navigate('/user/dashboard')}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-200/50 group-hover:scale-105 transition-all duration-300">
                                <FaShoppingBag className="text-white text-xl group-hover:rotate-6 transition-transform duration-300" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                ShopEase
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                Premium Store
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 max-w-2xl mx-8">
                        <div className="flex items-center gap-3 w-full">
                            <div className="relative flex-1">
                                <SearchInput
                                    value={searchTerm}
                                    onchange={handleSearch}
                                    placeholder="Search for products..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                />
                                <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            </div>

                            <div className="relative group" ref={dropdownRef}>
                                <button
                                    type="button"
                                    className={`
                                        inline-flex justify-between items-center
                                        min-w-[160px] rounded-xl
                                        border border-gray-200
                                        shadow-sm px-4 py-2.5
                                        bg-gradient-to-r from-gray-50 to-white
                                        text-sm font-medium text-gray-700
                                        hover:from-amber-50 hover:to-yellow-50
                                        hover:border-amber-200 hover:text-amber-700
                                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                                        transition-all duration-300
                                    `}
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                >
                                    <span className="flex items-center gap-2">
                                        {selectedCategoryLabel === "All Categories" ? (
                                            <MdDashboard className="text-amber-500" />
                                        ) : (
                                            <MdCategory className="text-amber-500" />
                                        )}
                                        {selectedCategoryLabel}
                                    </span>
                                    <ChevronDownIcon
                                        className={`
                                            ml-2 h-5 w-5 text-gray-400
                                            group-hover:text-amber-500
                                            transition-transform duration-300
                                            ${showCategoryDropdown ? 'rotate-180' : ''}
                                        `}
                                    />
                                </button>

                                {showCategoryDropdown && (
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 mt-2 w-max min-w-[500px] max-h-[400px] overflow-y-auto
                                            rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5
                                            focus:outline-none z-50 animate-fadeInUp
                                            p-4 grid grid-cols-2 gap-4 border border-gray-100"
                                        role="menu"
                                    >
                                        <div className="col-span-2 mb-2">
                                            <button
                                                onClick={() => handleCategorySelect("All Categories")}
                                                className={`
                                                    w-full text-center px-4 py-3 rounded-lg text-sm
                                                    flex items-center justify-center gap-3
                                                    transition-all duration-200 border
                                                    ${selectedCategoryLabel === "All Categories"
                                                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 font-bold border-amber-300 shadow-md'
                                                        : 'bg-white text-gray-800 hover:bg-gray-50 hover:text-gray-900 border-gray-200'
                                                    }
                                                `}
                                            >
                                                <MdDashboard className="text-xl" />
                                                <span className="text-base">View All Categories</span>
                                            </button>
                                            <div className="border-b border-gray-100 my-3"></div>
                                        </div>

                                        {categories.length > 0 ? (
                                            categories.map((cat) => (
                                                <div key={cat.category_id} className="group relative">
                                                    <button
                                                        onClick={() => handleCategorySelect(cat.category)}
                                                        className={`
                                                            w-full text-left px-4 py-3 rounded-lg text-sm
                                                            flex items-center gap-3
                                                            transition-all duration-200 border
                                                            ${selectedCategoryLabel === cat.category
                                                                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 font-semibold border-amber-300 shadow-sm'
                                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-gray-100'
                                                            }
                                                        `}
                                                    >
                                                        <MdCategory className="text-gray-400 text-lg" />
                                                        <span className="flex-1">{cat.category}</span>
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center py-4 text-gray-500">No categories available.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {token ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                                    <BiUser className="text-amber-500 text-lg" />
                                    <span className="text-sm font-medium text-gray-700">My Account</span>
                                </div>

                                <div className="h-8 w-px bg-gray-200"></div>

                                <button
                                    onClick={handleLogout}
                                    className="group flex items-center gap-3 px-6 py-2.5
                                        bg-gradient-to-r from-rose-500 to-red-500
                                        text-white rounded-xl font-semibold text-sm
                                        shadow-lg shadow-rose-500/30
                                        hover:shadow-xl hover:shadow-rose-500/40
                                        hover:scale-105 active:scale-95
                                        transition-all duration-300"
                                >
                                    <span>Logout</span>
                                    <BiLogOut className="text-xl group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/login')} className={navBtnStyle}>
                                    <div className={iconBoxStyle}>
                                        <BiLogIn className="text-lg text-amber-600" />
                                    </div>
                                    <span>Login</span>
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="group relative flex items-center gap-2 px-6 py-2.5
                                        bg-gradient-to-r from-amber-500 to-amber-600
                                        text-white rounded-xl font-semibold text-sm
                                        shadow-lg shadow-amber-500/30
                                        hover:shadow-xl hover:shadow-amber-500/40
                                        hover:scale-105 active:scale-95
                                        transition-all duration-300
                                        overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <FaUserPlus className="text-lg relative z-10" />
                                    <span className="relative z-10">Register</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-full
                bg-gradient-to-r from-amber-200/20 via-yellow-200/20 to-amber-200/20
                blur-3xl -z-10">
            </div>
        </nav>
    );
};

export default Navbar;