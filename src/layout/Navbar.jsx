import React from "react";
import { useNavigate } from "react-router-dom";
import { BiLogOut, BiUserPlus, BiLogIn } from "react-icons/bi";
import { FaUser, FaUserPlus } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";

export const Navbar = () => {
    const navigate = useNavigate();
    
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navBtnStyle = `
        group flex items-center gap-2 px-5 py-2.5 rounded-2xl 
        text-[#3d4a3e] font-bold text-sm transition-all duration-700 ease-out
        hover:bg-[#fef9c3] hover:text-[#854d0e] 
        hover:shadow-[0_10px_20px_-5px_rgba(234,179,8,0.3)]
        active:scale-95
    `;

    const iconBoxStyle = `
        p-1.5 bg-[#ecf3e9] rounded-xl group-hover:bg-white transition-all duration-500
    `;

    return (
        <nav className="sticky top-6 z-50 px-6">
            <div className="max-w-6xl mx-auto bg-[#f8faf7]/80 backdrop-blur-2xl border border-[#d1dbcd] shadow-[0_20px_50px_-20px_rgba(45,64,48,0.15)] rounded-[32px] px-7 sm:px-10 transition-all duration-500">
                <div className="flex justify-between items-center h-20">

                    <div 
                        className="flex-shrink-0 flex items-center gap-4 group cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 bg-[#2d4030] rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-[10deg] transition-all duration-500">
                                <span className="text-[#fef9c3] font-serif text-2xl font-black">E</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#eab308] border-2 border-[#f8faf7] rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-[#2d4030] tracking-tight font-sans">
                                E-commerce
                            </span>
                            <span className="text-[10px] text-[#5c7a5f] font-bold uppercase tracking-[0.3em] leading-none">
                                Premium Inventory
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#fefce8]/40 p-2 rounded-[24px] border border-[#fef9c3]/50">
                            
                            {token ? (
                                <div className="flex items-center gap-1 md:gap-3">
                                    <button onClick={() => navigate('/users')} className={navBtnStyle}>
                                        <div className={iconBoxStyle}>
                                            <FaUser className="text-lg text-[#4a634d] group-hover:text-[#eab308]" />
                                        </div>
                                        <span className="hidden sm:inline">User</span>
                                    </button>

                                    <button onClick={() => navigate('/roles')} className={navBtnStyle}>
                                        <div className={iconBoxStyle}>
                                            <HiUserGroup className="text-lg text-[#4a634d] group-hover:text-[#eab308]" />
                                        </div>
                                        <span className="hidden sm:inline">Role</span>
                                    </button>

                                    

                                    <div className="h-10 w-[1px] bg-[#d1dbcd] mx-2 hidden md:block"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="group flex items-center gap-3 px-6 py-2.5 bg-[#f32f2f] text-[#fef2f2] rounded-2xl font-bold text-sm shadow-lg shadow-red-900/10 transition-all duration-500 hover:bg-[#dd0c0c] hover:text-white active:scale-95"
                                    >
                                        <span className="hidden md:inline">Logout</span>
                                        <BiLogOut className="text-xl group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                               
                                <div className="flex items-center gap-1 md:gap-3">
                                    <button onClick={() => navigate('/login')} className={navBtnStyle}>
                                        <div className={iconBoxStyle}>
                                            <BiLogIn className="text-lg text-[#4a634d] group-hover:text-[#eab308]" />
                                        </div>
                                        <span>Login</span>
                                    </button>

                                    <button onClick={() => navigate('/')} className={`${navBtnStyle} bg-[#2d4030] text-white hover:bg-[#3d5641]`}>
                                        <div className="p-1.5 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all">
                                            <FaUserPlus className="text-lg text-[#fef9c3]" />
                                        </div>
                                        <span>Register</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-[#eab308]/5 blur-[100px] -z-10"></div>
        </nav>
    );
};

export default Navbar;