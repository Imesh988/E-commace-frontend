import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiLogOut, BiLogIn, BiUser, BiSearch, BiBell, BiHeart, BiCog } from "react-icons/bi";
import { FaShoppingBag, FaClipboardList, FaCashRegister, FaUserPlus } from "react-icons/fa";
import { MdCategory, MdDashboard, MdOutlineShoppingCart } from 'react-icons/md';
import { HiMiniHome } from "react-icons/hi2";
import { ChevronDownIcon } from "lucide-react";
import SearchInput from "../components/SearchInput";
import { categoryAPI } from "../services/api";
import { TbTruckReturn } from "react-icons/tb";

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const [searchTerm, setSearchTerm] = useState("");
    const [categories, setCategories] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("All Categories");
    const dropdownRef = useRef(null);
    const isDashboard = location.pathname === '/' || location.pathname === '/user/dashboard';

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setSearchTerm(queryParams.get('search') || '');
        setSelectedCategoryLabel(queryParams.get('category') || "All Categories");
    }, [location.search]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryAPI.getAllCategory();
            setCategories(res.data?.data || []);
        } catch (error) {
            setCategories([]);
        }
    }, []);

    useEffect(() => {
        if (isDashboard) fetchCategories();
    }, [fetchCategories, isDashboard]);

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
        value.trim() ? queryParams.set('search', value.trim()) : queryParams.delete('search');
        navigate(`${location.pathname}?${queryParams.toString()}`);
    };

    const handleCategorySelect = (categoryName) => {
        setSelectedCategoryLabel(categoryName);
        setShowCategoryDropdown(false);
        const queryParams = new URLSearchParams(location.search);
        categoryName !== "All Categories" ? queryParams.set('category', categoryName) : queryParams.delete('category');
        navigate(`${location.pathname}?${queryParams.toString()}`);
    };

    const IconButton = ({ onClick, icon: Icon, label, variant = "ghost" }) => {
        const styles = {
            ghost: "text-gray-600 hover:bg-amber-50 hover:text-amber-600",
            primary: "bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-600",
            danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
            outline: "border-2 border-amber-500 text-amber-600 hover:bg-amber-50"
        };
        return (
            <div className="relative group flex flex-col items-center">
                <button onClick={onClick} className={`p-2.5 rounded-2xl transition-all duration-200 active:scale-90 ${styles[variant]}`}>
                    <Icon size={22} />
                </button>
                <div className="absolute -bottom-10 scale-0 transition-all duration-200 rounded-lg bg-gray-900 px-3 py-1.5 text-[11px] font-bold text-white group-hover:scale-100 z-[100] whitespace-nowrap shadow-xl border border-gray-700">
                    {label}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
            </div>
        );
    };

    return (
        <nav className="sticky top-0 z-50 px-4 py-4 bg-transparent">
            <div className="max-w-[85%] mx-auto bg-white border border-gray-100 shadow-xl shadow-slate-200/50 rounded-[2rem] px-6">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 transition-transform group-hover:rotate-12">
                            <FaShoppingBag className="text-white text-lg" />
                        </div>
                        <span className="text-2xl font-black text-gray-800 hidden xl:block tracking-tighter">ShopEase</span>
                    </div>
                    <div className="flex items-center justify-end flex-1">
                        {isDashboard && (
                            <div className="hidden md:flex items-center gap-3 mr-4 w-full max-w-xl">
                                <div className="relative flex-1">
                                    <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                                    <SearchInput value={searchTerm} onchange={handleSearch} placeholder="Search for items..." className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 transition-all text-sm font-medium text-gray-700 outline-none" />
                                </div>
                                <div className="relative" ref={dropdownRef}>
                                    <button onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl transition-all text-sm font-bold text-gray-600 hover:text-amber-600 hover:bg-amber-50">
                                        <MdCategory className="text-amber-500" />
                                        <span className="hidden lg:inline truncate max-w-[100px] font-bold">{selectedCategoryLabel}</span>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showCategoryDropdown && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                                            <button onClick={() => handleCategorySelect("All Categories")} className="w-full text-left px-4 py-3 rounded-xl text-sm hover:bg-amber-50 transition-colors flex items-center gap-3 font-bold text-gray-700">
                                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><MdDashboard className="text-amber-600" /></div>
                                                All Categories
                                            </button>
                                            <div className="h-px bg-gray-100 my-2 mx-2" />
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar px-1">
                                                {categories.map((cat) => (
                                                    <button key={cat.category_id} onClick={() => handleCategorySelect(cat.category)} className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-amber-600 transition-all font-medium mb-1">{cat.category}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {token ? (
                                <div className="flex items-center gap-1">
                                    <IconButton onClick={() => navigate('/')} icon={HiMiniHome} label="Home" />
                                    <IconButton onClick={() => navigate('/orders')} icon={FaClipboardList} label="Orders" />
                                    <IconButton onClick={() => navigate('/wishlist')} icon={BiHeart} label="Wishlist" />
                                    <IconButton onClick={() => navigate('/cart')} icon={MdOutlineShoppingCart} label="Cart" />
                                    <IconButton onClick={() => navigate('/returnorders')} icon={TbTruckReturn} label="Return Orders" />
                                    <IconButton onClick={() => navigate('/checkout')} icon={FaCashRegister} label="Checkout" variant="primary" />
                                    <div className="w-px h-8 bg-gray-200 mx-1" />
                                    <IconButton onClick={() => navigate('/settings')} icon={BiCog} label="Settings" />
                                    <IconButton onClick={() => navigate('/profile')} icon={BiUser} label="Profile" />
                                    <IconButton onClick={handleLogout} icon={BiLogOut} label="Logout" variant="danger" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 md:gap-2">
                                    <IconButton onClick={() => navigate('/login')} icon={BiLogIn} label="Login" />
                                    <IconButton onClick={() => navigate('/')} icon={FaUserPlus} label="Register" variant="primary" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;