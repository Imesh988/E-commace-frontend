import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import {
    Plus, Eye, Share2, Users, DollarSign, BarChart3,
    Settings, Home, Search, Mail, User, Star,
    ChevronRight
} from 'lucide-react';
import SuperAdminNavbar from '../layout/SuperadminNav';
import { sellerApi, superAdminApi } from '../services/api'; 
import { SlUser } from 'react-icons/sl';
import { TbUser } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sellerCount, setSellerCount] = useState(0);
    const [superAdminCount, setSuperAdminCount] = useState(0); 

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const profileRes = await axiosInstance.get('/auth/verify-profile');
                setProfile(profileRes.data);

                const sellerRes = await sellerApi.getAllSeller();
                const sellers = sellerRes.data?.data || sellerRes.data || [];
                setSellerCount(sellers.length);

                const superAdminRes = await superAdminApi.getAllSuperAdmin();
                const superadmins = superAdminRes.data?.data || superAdminRes.data || [];
                setSuperAdminCount(superadmins.length);

            } catch (err) {
                console.log("Dashboard Data Fetch Error:", err);
                if (err.response?.status === 401) handleLogout();
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const maxCount = Math.max(sellerCount, superAdminCount, 10);
    const sellerLineY = 100 - (sellerCount / (maxCount * 1.2)) * 100;
    const superAdminLineY = 100 - (superAdminCount / (maxCount * 1.2)) * 100;

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#f8faf9]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f8faf9] font-sans pb-24">
            <SuperAdminNavbar onLogout={handleLogout} profile={profile} />

            <main className="px-6 md:px-12 max-w-7xl mx-auto space-y-10 mt-10">

                <section>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-4xl font-extrabold text-[#2d4030] tracking-tight">Overview</h2>
                            <p className="text-gray-400 text-sm font-medium">Performance Metrics</p>
                        </div>
                    </div>

                    <div className="text-[11px] font-bold text-gray-400 mb-4 tracking-widest uppercase">Quick Actions</div>
                    <div className="flex flex-wrap gap-4 mb-10">
                        <button
                            onClick={() => navigate('/roleForm')}
                            className="flex items-center gap-3 bg-[#70e0a3] text-white px-6 py-3.5 rounded-2xl shadow-lg shadow-green-100 hover:bg-green-600 transition-all hover:-translate-y-1">
                            <div className="bg-white/20 p-1 rounded-md"><Plus size={18} strokeWidth={3} /></div>
                            <span className="font-bold">Create New Role</span>
                        </button>
                        <button 
                            onClick={() => navigate('/superAdminForm')}
                            className="flex items-center gap-3 bg-[#fef9c3] text-yellow-800 px-6 py-3.5 rounded-2xl hover:bg-yellow-200 transition-all hover:-translate-y-1">
                            <Plus size={20} />
                            <span className="font-bold">Create New Super Admin</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-xl">
                            <div className="absolute top-0 right-0 p-6">
                                <BarChart3 size={28} className="text-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                <TbUser size={24} className="text-emerald-600" />
                            </div>
                            <p className="text-xs font-bold text-gray-400 tracking-wider">TOTAL SELLERS</p>
                            <p className="text-3xl font-black text-gray-800 mt-1">
                                {sellerCount.toLocaleString()}
                            </p>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-40 group-hover:opacity-100 transition-opacity"></div>
                        </div>

                        <div className="bg-[#fffbeb] p-8 rounded-[35px] border border-yellow-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-xl">
                            <div className="absolute top-0 right-0 p-6">
                                <BarChart3 size={28} className="text-yellow-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                <SlUser size={24} className="text-yellow-600" />
                            </div>
                            <p className="text-xs font-bold text-gray-400 tracking-wider">TOTAL SUPER ADMINS</p>
                            <p className="text-3xl font-black text-gray-800 mt-1">
                                {superAdminCount.toLocaleString()}
                            </p>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-30"></div>
                        </div>
                    </div>  
                </section>

                <section className="bg-white p-10 rounded-[45px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-[#2d4030] tracking-tight">Ecosystem Growth</h3>
                            <p className="text-xs font-bold text-gray-400 tracking-widest">SELLERS VS SUPER ADMINS ONBOARDING TREND</p>
                        </div>
                        
                        <div className="flex gap-6 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                                <span className="text-gray-500">Super Admins ({superAdminCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                                <span className="text-gray-500">Sellers ({sellerCount})</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full relative mb-10">
                        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-sm">
                            <path 
                                d={`M0,95 Q250,${superAdminLineY + 10} 500,${superAdminLineY} T1000,${superAdminLineY - 5}`} 
                                fill="none" 
                                stroke="#fbbf24" 
                                strokeWidth="4" 
                                strokeLinecap="round" 
                                className="opacity-80 transition-all duration-1000"
                            />
                            
                            <path 
                                d={`M0,95 Q250,${sellerLineY + 15} 500,${sellerLineY} T1000,${sellerLineY - 10}`} 
                                fill="none" 
                                stroke="#4ade80" 
                                strokeWidth="4" 
                                strokeLinecap="round" 
                                className="transition-all duration-1000"
                            />
                        </svg>
                        
                        <div className="flex justify-between text-xs font-bold text-gray-300 mt-4 border-t border-gray-50 pt-2">
                            <span>INITIAL STATE</span>
                            <span>GROWTH PHASE</span>
                            <span>CURRENT PEAK</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                        <div className="group">
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Total Seller Network</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-gray-800">{sellerCount}</p>
                                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">▲ Live</span>
                            </div>
                        </div>
                        <div className="group">
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">Total Super Admin Network</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-gray-800">{superAdminCount}</p>
                                <span className="text-[10px] font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full">● Active</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;