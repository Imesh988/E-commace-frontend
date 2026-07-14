import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiLogOut, BiLogIn, BiUser, BiHeart, BiCog, BiCheck } from "react-icons/bi";
import { FaShoppingBag, FaClipboardList, FaCashRegister, FaUserPlus } from "react-icons/fa";
import { MdCategory, MdDashboard, MdOutlineShoppingCart } from 'react-icons/md';
import { HiMiniHome } from "react-icons/hi2";
import { ChevronDownIcon } from "lucide-react";
import { categoryAPI } from "../services/api";
import { TbTruckReturn } from "react-icons/tb";
import clsx from 'clsx';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const [categories, setCategories] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("All Categories");
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
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

    const handleCategorySelect = (categoryName) => {
        setSelectedCategoryLabel(categoryName);
        setShowCategoryDropdown(false);
        const queryParams = new URLSearchParams(location.search);
        categoryName !== "All Categories" ? queryParams.set('category', categoryName) : queryParams.delete('category');
        navigate(`${location.pathname}?${queryParams.toString()}`);
    };

    const navBtnStyle = `
        group flex items-center gap-2 px-4 py-2 rounded-xl 
        text-[#3d4a3e] font-bold text-sm transition-all duration-500 ease-out
        hover:bg-[#fef9c3] hover:text-[#854d0e] 
        active:scale-95
    `;

    const iconBoxStyle = `
        p-1.5 bg-[#ecf3e9] rounded-xl group-hover:bg-white transition-all duration-300
    `;

    const IconButton = ({ onClick, icon: Icon, label, variant = "ghost" }) => {
        let buttonClasses = navBtnStyle;
        if (variant === "danger") {
            buttonClasses = `
                group flex items-center gap-2 px-5 py-2.5 bg-[#f32f2f] text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-100 transition-all hover:bg-[#dd0c0c] active:scale-95
            `;
        } else if (variant === "primary") {
            buttonClasses = `
                group flex items-center gap-2 px-5 py-2.5 bg-[#2d4030] text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-100 transition-all hover:bg-[#1e2e20] active:scale-95
            `;
        }
        return (
            <button onClick={onClick} className={buttonClasses}>
                <div className={iconBoxStyle}>
                    <Icon className="text-[#4a634d]" size={18} />
                </div>
                <span>{label}</span>
            </button>
        );
    };

    return (
        <nav className={clsx('sticky', 'top-4', 'z-50', 'px-4', 'md:px-12')}>
            <div className={clsx('w-full', 'bg-white/80', 'backdrop-blur-2xl', 'border', 'border-[#d1dbcd]', 'shadow-xl', 'rounded-[32px]', 'px-6', 'transition-all', 'duration-500')}>
                <div className={clsx('flex', 'flex-wrap', 'items-center', 'justify-between', 'h-20')}>

                    <div 
                        className={clsx('flex-shrink-0', 'flex', 'items-center', 'gap-3', 'group', 'cursor-pointer')}
                        onClick={() => navigate('/')}
                    >
                        <div className={clsx('w-10', 'h-10', 'bg-[#2d4030]', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'shadow-lg', 'transform', 'group-hover:rotate-6', 'transition-all')}>
                            <FaShoppingBag className={clsx('text-[#fef9c3]', 'text-lg')} />
                        </div>
                        <div className={clsx('flex', 'flex-col')}>
                            <span className={clsx('text-lg', 'font-black', 'text-[#2d4030]', 'leading-none')}>ShopEase</span>
                            <span className={clsx('text-[9px]', 'text-green-600', 'font-bold', 'uppercase', 'tracking-widest', 'mt-1')}>Status: Active</span>
                        </div>
                    </div>

                    <div className={clsx('flex', 'items-center', 'gap-2', 'md:gap-4', 'flex-wrap')}>
                        <div className={clsx('hidden', 'lg:flex', 'items-center', 'gap-1', 'bg-gray-50/50', 'p-1.5', 'rounded-2xl', 'border', 'border-gray-100')}>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    ref={buttonRef}
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className={navBtnStyle}
                                >
                                    <div className={iconBoxStyle}>
                                        <MdCategory className="text-[#4a634d]" size={18} />
                                    </div>
                                    <span className={clsx('truncate', 'max-w-[100px]')}>{selectedCategoryLabel}</span>
                                    <ChevronDownIcon 
                                        className={`w-4 h-4 text-[#4a634d] transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`} 
                                    />
                                </button>

                                {showCategoryDropdown && (
                                    <div 
                                        className={clsx('absolute', 'right-0', 'mt-3', 'w-72', 'bg-white/90', 'backdrop-blur-xl', 'border', 'border-white/30', 'rounded-2xl', 'shadow-2xl', 'shadow-amber-200/40', 'z-50', 'p-2', 'animate-in', 'slide-in-from-top-5', 'fade-in', 'duration-200')}
                                    >
                                        <div className={clsx('px-3', 'py-2', 'mb-1', 'border-b', 'border-gray-100/50')}>
                                            <span className={clsx('text-xs', 'font-bold', 'text-gray-400', 'uppercase', 'tracking-wider')}>Browse Categories</span>
                                        </div>

                                        <button 
                                            onClick={() => handleCategorySelect("All Categories")} 
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 group ${
                                                selectedCategoryLabel === "All Categories" 
                                                    ? "bg-[#fef9c3] text-[#854d0e] font-bold" 
                                                    : "text-gray-600 hover:bg-[#fef9c3]/50 hover:text-[#854d0e]"
                                            }`}
                                        >
                                            <div className={clsx('w-8', 'h-8', 'rounded-lg', 'bg-[#ecf3e9]', 'flex', 'items-center', 'justify-center', 'group-hover:scale-110', 'transition-transform')}>
                                                <MdDashboard className="text-[#4a634d]" />
                                            </div>
                                            <span className="flex-1">All Categories</span>
                                            {selectedCategoryLabel === "All Categories" && <BiCheck className={clsx('text-[#4a634d]', 'text-lg')} />}
                                        </button>

                                        <div className={clsx('h-px', 'bg-gray-100/50', 'my-2', 'mx-2')} />

                                        <div className={clsx('max-h-64', 'overflow-y-auto', 'custom-scrollbar', 'px-1')}>
                                            {categories.map((cat) => (
                                                <button 
                                                    key={cat.category_id} 
                                                    onClick={() => handleCategorySelect(cat.category)} 
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 group ${
                                                        selectedCategoryLabel === cat.category 
                                                            ? "bg-[#fef9c3] text-[#854d0e] font-bold" 
                                                            : "text-gray-600 hover:bg-[#fef9c3]/50 hover:text-[#854d0e]"
                                                    }`}
                                                >
                                                    <span className={clsx('w-6', 'h-6', 'rounded-full', 'bg-[#ecf3e9]', 'flex', 'items-center', 'justify-center', 'text-xs', 'font-bold', 'text-[#4a634d]', 'group-hover:scale-110', 'transition-transform')}>
                                                        {cat.category.charAt(0).toUpperCase()}
                                                    </span>
                                                    <span className="flex-1">{cat.category}</span>
                                                    {selectedCategoryLabel === cat.category && <BiCheck className={clsx('text-[#4a634d]', 'text-lg')} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => navigate('/')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><HiMiniHome className="text-[#4a634d]" size={18} /></div>
                                <span>Home</span>
                            </button>

                            <button onClick={() => navigate('/orders')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><FaClipboardList className="text-[#4a634d]" size={18} /></div>
                                <span>Orders</span>
                            </button>

                            {/* <button onClick={() => navigate('/wishlist')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><BiHeart className="text-[#4a634d]" size={18} /></div>
                                <span>Wishlist</span>
                            </button> */}

                            <button onClick={() => navigate('/cart')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><MdOutlineShoppingCart className="text-[#4a634d]" size={18} /></div>
                                <span>Cart</span>
                            </button>

                            <button onClick={() => navigate('/returnorders')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><TbTruckReturn className="text-[#4a634d]" size={18} /></div>
                                <span>Returns</span>
                            </button>

                            <button onClick={() => navigate('/checkout')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><FaCashRegister className="text-[#4a634d]" size={18} /></div>
                                <span>Checkout</span>
                            </button>

                            <div className={clsx('h-8', 'w-[1px]', 'bg-gray-200', 'mx-2', 'hidden', 'md:block')}></div>

                            {/* <button onClick={() => navigate('/settings')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><BiCog className="text-[#4a634d]" size={18} /></div>
                                <span>Settings</span>
                            </button> */}

                            <button onClick={() => navigate('/profile')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><BiUser className="text-[#4a634d]" size={18} /></div>
                                <span>Profile</span>
                            </button>

                        </div>

                        <div className={clsx('flex', 'items-center', 'gap-3')}>
                            {token ? (
                                <button
                                    onClick={handleLogout}
                                    className={clsx('group', 'flex', 'items-center', 'gap-2', 'px-5', 'py-2.5', 'bg-[#f32f2f]', 'text-white', 'rounded-2xl', 'font-bold', 'text-sm', 'shadow-lg', 'shadow-red-100', 'transition-all', 'hover:bg-[#dd0c0c]', 'active:scale-95')}
                                >
                                    <span className={clsx('hidden', 'sm:inline')}>Logout</span>
                                    <BiLogOut className="text-lg" />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className={clsx('group', 'flex', 'items-center', 'gap-2', 'px-5', 'py-2.5', 'bg-[#2d4030]', 'text-white', 'rounded-2xl', 'font-bold', 'text-sm', 'shadow-lg', 'shadow-green-100', 'transition-all', 'hover:bg-[#1e2e20]', 'active:scale-95')}
                                    >
                                        <span className={clsx('hidden', 'sm:inline')}>Login</span>
                                        <BiLogIn className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/userRegister')}
                                        className={clsx('group', 'flex', 'items-center', 'gap-2', 'px-5', 'py-2.5', 'bg-[#2d4030]', 'text-white', 'rounded-2xl', 'font-bold', 'text-sm', 'shadow-lg', 'shadow-green-100', 'transition-all', 'hover:bg-[#1e2e20]', 'active:scale-95')}
                                    >
                                        <span className={clsx('hidden', 'sm:inline')}>Register</span>
                                        <FaUserPlus className="text-lg" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;