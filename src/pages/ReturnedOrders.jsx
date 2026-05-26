import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { orderApi } from "../services/api";
import { toast } from "react-toastify";
import Navbar from "../layout/Navbar";


const ReturnStatusBadge = ({ status }) => {
    if (status === null || status === undefined) return null;
    const config = {
        0: { label: 'Return Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        1: { label: 'Return Approved', color: 'bg-green-100 text-green-700 border-green-200' },
        2: { label: 'Return Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
        3: { label: 'Refunded', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    };
    const { label, color } = config[status] || config[0];
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${color}`}>
            {label}
        </span>
    );
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-600"></div>
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
            // console.log('orders ', ordersArray);
            
            const userStr = localStorage.getItem('user');
            // console.log('user' , userStr);
            
            let currentUserId = null;
            if (userStr) {
                try {
                    const userObj = JSON.parse(userStr);
                    currentUserId = userObj.user_id;
                    console.log('current user id' , currentUserId);

                    console.log('current user' , userObj);
                    
                } catch(e) { console.error(e); }
            }
            if (!currentUserId) {
                currentUserId = localStorage.getItem('user_id');
            }
            const userOrders = ordersArray.filter(order => order.user_id == currentUserId);
            console.log('current ordrs ', userOrders);
            
            const returned = userOrders.filter(order => order.return_status !== null && order.return_status !== undefined);
            setReturnedOrders(returned);

            console.log('return orders' , returned);
            
        } catch (error) {
            console.error('Failed to fetch returned orders:', error);
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

    const getReturnStatusLabel = (status) => {
        switch(status) {
            case 0: return 'Return Pending';
            case 1: return 'Return Approved';
            case 2: return 'Return Rejected';
            case 3: return 'Refunded';
            default: return 'Return Requested';
        }
    };

    const filteredOrders = getFilteredOrders();

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <Navbar />

             <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 z-0"></div>
                <div className="absolute bottom-1/4 right-1/2 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
            </div>
            <div className="max-w-[2440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28">
                <div className="mb-8">
                    {/* <h1 className="text-3xl font-bold text-slate-900">My Return Requests</h1>
                    <p className="text-slate-500 mt-2">Track and manage your return requests</p> */}
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            activeFilter === 'all' 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        All ({returnedOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveFilter('0')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            activeFilter === '0' 
                            ? 'bg-yellow-600 text-white shadow-md' 
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Pending ({returnedOrders.filter(o => o.return_status === 0).length})
                    </button>
                    <button
                        onClick={() => setActiveFilter('1')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            activeFilter === '1' 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Approved ({returnedOrders.filter(o => o.return_status === 1).length})
                    </button>
                    <button
                        onClick={() => setActiveFilter('2')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            activeFilter === '2' 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Rejected ({returnedOrders.filter(o => o.return_status === 2).length})
                    </button>
                    <button
                        onClick={() => setActiveFilter('3')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            activeFilter === '3' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Refunded ({returnedOrders.filter(o => o.return_status === 3).length})
                    </button>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No return requests found</h3>
                        <p className="text-slate-500 mb-8">You haven't submitted any return requests yet</p>
                        <Link to="/orders" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                            View My Orders
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrders.map((order) => (
                            <div key={order.order_id} className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                                <div className="p-5 border-b border-slate-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                                            <p className="font-mono font-bold text-slate-800 text-sm">#{order.order_id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <ReturnStatusBadge status={order.return_status} />
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Return ID:</span>
                                        <span className="font-mono text-slate-700">{order.return_id || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-sm">Return Status:</span>
                                        <span className="font-semibold text-slate-800">{getReturnStatusLabel(order.return_status)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-sm">Total Amount:</span>
                                        <span className="font-bold text-emerald-600">LKR {parseFloat(order.total_amount).toLocaleString()}</span>
                                    </div>
                                    {order.refund_amount && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 text-sm">Refund Amount:</span>
                                            <span className="font-bold text-blue-600">LKR {parseFloat(order.refund_amount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-sm">Request Date:</span>
                                        <span className="text-slate-700 text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {order.admin_reason && (
                                        <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admin Remark</p>
                                            <p className="text-sm text-slate-600">{order.admin_reason}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-slate-50/50">
                                    <Link
                                        to={`/orders/${order.order_id}`}
                                        className="block w-full text-center py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
                                    >
                                        View Order Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnedOrders;