import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from "../services/api";
import { toast } from "react-toastify";
import Navbar from "../layout/Navbar";

// Enhanced Order Status Badge
const OrderStatusBadge = ({ status }) => {
    const statusConfig = {
        1: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        2: { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        3: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        4: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        5: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200' }
    };
    const config = statusConfig[status] || statusConfig[1];
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${config.color}`}>
            {config.label}
        </span>
    );
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
    </div>
);

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getAllOrders();
            const ordersArray = response.data?.data || response.data?.orders || [];
            setOrders(ordersArray);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to fetch orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOrders = () => {
        return activeTab === 'active' 
            ? orders.filter(order => order.status !== 5) 
            : orders.filter(order => order.status === 5);
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const response = await orderApi.cancelOrder(orderId);
            if (response.data.success) {
                toast.success('Order cancelled successfully!');
                fetchOrders();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Please login to view your orders');
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                       
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/60">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                activeTab === 'active' 
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Active ({orders.filter(o => o.status !== 5).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('cancelled')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                activeTab === 'cancelled' 
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-200' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Cancelled ({orders.filter(o => o.status === 5).length})
                        </button>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
                        <p className="text-slate-500 mb-8">Items you order will appear here</p>
                        <Link to="/" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredOrders.map((order, idx) => (
                            <div 
                                key={order.order_id}
                                className="group bg-white rounded-[2rem] border border-slate-200/60 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 overflow-hidden flex flex-col animate-fadeIn"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="p-6 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                            <svg className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <OrderStatusBadge status={order.status} />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Reference</p>
                                        <p className="text-sm font-mono font-bold text-slate-700">
                                            #{order.order_id.slice(-8).toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50/50 flex-grow">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-xl font-black text-slate-900">
                                                <span className="text-sm font-bold mr-1">LKR</span>
                                                {parseFloat(order.total_amount).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                            <p className="text-xs font-bold text-slate-600">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white mt-auto grid grid-cols-2 gap-3">
                                    <Link
                                        to={`/orders/${order.order_id}`}
                                        className="col-span-2 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all duration-300"
                                    >
                                        View Details
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                    
                                    {order.status === 1 && activeTab !== 'cancelled' && (
                                        <button
                                            onClick={() => handleCancelOrder(order.order_id)}
                                            className="col-span-2 py-2.5 text-rose-600 text-xs font-bold hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default OrdersPage;