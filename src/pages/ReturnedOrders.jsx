import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { orderApi } from "../services/api";
import { toast } from "react-toastify";
import Navbar from "../layout/Navbar";
import { 
    FiPackage, FiClock, FiCheckCircle, FiXCircle, 
    FiRefreshCw, FiDollarSign, FiCalendar, FiArrowRight,
    FiSearch, FiShoppingBag, FiHash, FiInfo
} from 'react-icons/fi';
import { IoReturnUpBackOutline } from 'react-icons/io5';

const ReturnStatusBadge = ({ status }) => {
    if (status === null || status === undefined) return null;
    const config = {
        0: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-400' },
        1: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-400' },
        2: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-400' },
        3: { label: 'Refunded', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-400' }
    };
    const { label, bg, text, border, dot } = config[status] || config[0];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${bg} ${text} ${border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`}></span>
            {label}
        </span>
    );
};

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcfdf2]">
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-emerald-900 font-black uppercase tracking-[0.3em] text-[10px]">Processing Records</p>
    </div>
);

const ReturnedOrders = () => {
    const [returnedOrders, setReturnedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        fetchReturnedOrders();
    }, []);

    const fetchReturnedOrders = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getAllOrders();
            const ordersArray = response.data?.data || response.data?.orders || [];
            
            const userStr = localStorage.getItem('user');
            let currentUserId = null;
            if (userStr) {
                try {
                    const userObj = JSON.parse(userStr);
                    currentUserId = userObj.user_id;
                } catch(e) { console.error(e); }
            }
            if (!currentUserId) {
                currentUserId = localStorage.getItem('user_id');
            }
            const userOrders = ordersArray.filter(order => order.user_id == currentUserId);
            const returned = userOrders.filter(order => order.return_status !== null && order.return_status !== undefined);
            setReturnedOrders(returned);
        } catch (error) {
            toast.error('Failed to fetch returned orders');
            setReturnedOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOrders = () => {
        if (activeFilter === 'all') return returnedOrders;
        return returnedOrders.filter(order => order.return_status == activeFilter);
    };

    const getStatusCount = (status) => {
        if (status === 'all') return returnedOrders.length;
        return returnedOrders.filter(o => o.return_status == status).length;
    };

    const filteredOrders = getFilteredOrders();

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen ">
            {/* Aesthetic Background */}
             <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[5%] right-[-5%] w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-[130px]"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-yellow-100/30 rounded-full blur-[110px]"></div>
            </div>

            <Navbar />

            <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-20 pt-10 pb-20">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
                    <div className="space-y-3">
                        
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex bg-white/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white shadow-xl shadow-emerald-900/5 items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Claims</span>
                                <span className="text-xl font-black text-emerald-600">{returnedOrders.length}</span>
                            </div>
                            <div className="h-8 w-px bg-slate-100"></div>
                            <Link to="/orders" className="p-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-all">
                                <FiShoppingBag size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Navigation / Filters */}
                <div className="flex flex-wrap gap-2 mb-10 bg-white/40 backdrop-blur-md p-2 rounded-[22px] border border-white/60 w-fit">
                    {[
                        { key: 'all', label: 'All Requests' },
                        { key: '0', label: 'Pending' },
                        { key: '1', label: 'Approved' },
                        { key: '2', label: 'Rejected' },
                        { key: '3', label: 'Refunded' }
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                activeFilter === filter.key 
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                            }`}
                        >
                            {filter.label} <span className="ml-1 opacity-50">({getStatusCount(filter.key)})</span>
                        </button>
                    ))}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-xl rounded-[60px] border border-white shadow-2xl">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
                            <IoReturnUpBackOutline className="text-5xl text-emerald-200" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">No returns found here</h2>
                        <p className="text-slate-500 mb-8 font-medium">Your claim history is currently empty.</p>
                        <Link to="/orders" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200/20 active:scale-95">
                            Browse My Orders
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.order_id}
                                className="group relative bg-white/80 backdrop-blur-md rounded-[35px] border border-white p-7 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 flex flex-col cursor-default hover:-translate-y-2"
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                            <FiHash className="text-emerald-500" /> Ref: {order.order_id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs font-black text-slate-800">
                                            Return ID: <span className="text-slate-400">#{order.return_id || 'PROC-001'}</span>
                                        </p>
                                    </div>
                                    <ReturnStatusBadge status={order.return_status} />
                                </div>

                                {/* Body Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Billed</p>
                                        <p className="text-base font-black text-slate-800 tracking-tighter">
                                            LKR {parseFloat(order.total_amount).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 group-hover:bg-white transition-colors">
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Refundable</p>
                                        <p className="text-base font-black text-emerald-600 tracking-tighter">
                                            LKR {parseFloat(order.refund_amount || order.total_amount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Info List */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase tracking-widest flex items-center gap-2"><FiCalendar className="text-emerald-500" /> Filed On</span>
                                        <span className="text-slate-700">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    
                                    {order.admin_reason && (
                                        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <FiInfo /> Remarks
                                            </p>
                                            <p className="text-[11px] text-amber-700 leading-relaxed font-medium italic">"{order.admin_reason}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action */}
                                <div className="mt-auto">
                                    <Link
                                        to={`/orders/${order.order_id}`}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-xl shadow-slate-200 hover:shadow-emerald-200 transition-all duration-300 group/btn"
                                    >
                                        View Full Audit <FiArrowRight className="text-lg group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 10s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
};

export default ReturnedOrders;