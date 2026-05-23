import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiLogOut, BiLogIn, BiUser } from "react-icons/bi";
import { FaUserPlus, FaShoppingBag, FaClipboardList } from "react-icons/fa";
import { MdOutlineShoppingCart } from 'react-icons/md';
import { HiMiniHome } from "react-icons/hi2";

export const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
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

                    <div className="flex items-center gap-2">
                        {token ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/')}
                                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-amber-50 transition shadow-sm"
                                >
                                    <HiMiniHome className="text-amber-600 text-xl" />
                                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">Dashboard</span>
                                </button>
                                 <button
                                    onClick={() => navigate('/orders')}
                                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-amber-50 transition shadow-sm"
                                >
                                    <FaClipboardList className="text-amber-600 text-xl" />
                                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">Orders</span>
                                </button>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-amber-50 transition shadow-sm"
                                >
                                    <MdOutlineShoppingCart className="text-amber-600 text-xl" />
                                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">Cart</span>
                                </button>
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="group flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    <span className="text-sm font-bold">Checkout</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </button>

                                <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                                    <BiUser className="text-amber-500 text-lg" />
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