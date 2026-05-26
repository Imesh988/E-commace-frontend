import React from "react";
import { useNavigate } from "react-router-dom";
import { BiLogOut, BiUserPlus } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { FiPackage } from "react-icons/fi";
import { SiHomebridge } from "react-icons/si";
import { GiReturnArrow } from "react-icons/gi";

export const SuperAdminNavbar = ({ onLogout, profile }) => {
    const navigate = useNavigate();

    const navBtnStyle = `
        group flex items-center gap-2 px-4 py-2 rounded-xl 
        text-[#3d4a3e] font-bold text-sm transition-all duration-500 ease-out
        hover:bg-[#fef9c3] hover:text-[#854d0e] 
        active:scale-95
    `;

    const iconBoxStyle = `
        p-1.5 bg-[#ecf3e9] rounded-xl group-hover:bg-white transition-all duration-300
    `;

    return (
        <nav className="sticky top-4 z-50 px-4 md:px-12">
            <div className="w-full bg-white/80 backdrop-blur-2xl border border-[#d1dbcd] shadow-xl rounded-[32px] px-6 transition-all duration-500">
                <div className="flex justify-between items-center h-20">

                    <div 
                        className="flex-shrink-0 flex items-center gap-3 group cursor-pointer"
                        onClick={() => navigate('/super-admin')}
                    >
                        <div className="w-10 h-10 bg-[#2d4030] rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all">
                            <span className="text-[#fef9c3] font-serif text-xl font-black">E</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-[#2d4030] leading-none">Admin HUB</span>
                            <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest mt-1">Status: Active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden lg:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
                            <button onClick={() => navigate('/sellerForm')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><FaUser className="text-[#4a634d]" /></div>
                                <span>Sellers Or Supplier</span>
                            </button>

                            <button onClick={() => navigate('/roleForm')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><HiUserGroup className="text-[#4a634d]" /></div>
                                <span>Roles</span>
                            </button>

                              <button onClick={() => navigate('/superAdminForm')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><BiUserPlus className="text-[#4a634d]" /></div>
                                <span>Super admin  </span>
                            </button>
                             <button onClick={() => navigate('/user')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><FaUser className="text-[#4a634d]" /></div>
                                <span>Users  </span>
                            </button>

                           

                            <button onClick={() => navigate('/adminorders')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><FiPackage className="text-[#4a634d]" /></div>
                                <span>Orders </span>
                            </button>

                                  <button onClick={() => navigate('/admin/returns')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><GiReturnArrow className="text-[#4a634d]" /></div>
                                <span>Return  Orders </span>
                            </button>

                              <button onClick={() => navigate('/super-admin/dashboard')} className={navBtnStyle}>
                                <div className={iconBoxStyle}><SiHomebridge className="text-[#4a634d]" /></div>
                                <span>Dashboard </span>
                            </button>

                           


                        </div>

                        <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>

                        <div className="flex items-center gap-3">
                       
                            <button
                                onClick={onLogout}
                                className="group flex items-center gap-2 px-5 py-2.5 bg-[#f32f2f] text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-100 transition-all hover:bg-[#dd0c0c] active:scale-95"
                            >
                                <span className="hidden sm:inline">Logout</span>
                                <BiLogOut className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default SuperAdminNavbar;