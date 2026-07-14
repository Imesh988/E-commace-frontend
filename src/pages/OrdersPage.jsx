import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { orderApi } from "../services/api";
import { toast } from "react-toastify";
import { FiPackage, FiCalendar, FiHash, FiArrowRight, FiXCircle, FiRotateCcw } from 'react-icons/fi';
import ReturnModal from "../pages/ReturnModal";
import Navbar from "../layout/Navbar";

const OrderStatusBadge = ({ status }) => {
    const statusConfig = {
        1: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-100', dot: 'bg-amber-400' },
        2: { label: 'Processing', color: 'text-blue-600 bg-blue-50 border-blue-100', dot: 'bg-blue-400' },
        3: { label: 'Shipped', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', dot: 'bg-indigo-400' },
        4: { label: 'Delivered', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400' },
        5: { label: 'Cancelled', color: 'text-rose-600 bg-rose-50 border-rose-100', dot: 'bg-rose-400' }
    };
    const config = statusConfig[status] || statusConfig[1];
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}></span>
            {config.label}
        </span>
    );
};

const ReturnStatusBadge = ({ status }) => {
    if (status === null || status === undefined) return null;
    const config = {
        0: { label: 'Return Pending', color: 'text-orange-600 bg-orange-50 border-orange-100' },
        1: { label: 'Approved', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        2: { label: 'Rejected', color: 'text-rose-600 bg-rose-50 border-rose-100' },
        3: { label: 'Refunded', color: 'text-sky-600 bg-sky-50 border-sky-100' }
    };
    const { label, color } = config[status] || config[0];
    return (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${color}`}>
            {label}
        </span>
    );
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getAllOrders();
            let ordersArray = response.data?.data || response.data?.orders || (Array.isArray(response.data) ? response.data : []);
            
            const uniqueOrdersMap = new Map();
            ordersArray.forEach(order => {
                if (order.order_id && !uniqueOrdersMap.has(order.order_id)) uniqueOrdersMap.set(order.order_id, order);
            });
            const uniqueOrders = Array.from(uniqueOrdersMap.values());

            let currentUserId = null;
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try { currentUserId = JSON.parse(userStr).user_id; } catch(e) {}
            }
            if (!currentUserId) currentUserId = localStorage.getItem('user_id');

            const userOrders = uniqueOrders.filter(order => String(order.user_id) === String(currentUserId));
            setOrders(userOrders);
        } catch (error) {
            toast.error('Failed to fetch orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
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

    const handleReturnClick = (order) => {
        setSelectedOrder(order);
        setShowReturnModal(true);
    };

    const handleReturnSuccess = () => {
        toast.info("Return request sent successfully.");
        fetchOrders();
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        fetchOrders();
    }, [navigate]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const filteredOrders = activeTab === 'active' 
        ? orders.filter(order => order.status !== 5) 
        : orders.filter(order => order.status === 5);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#fefefe]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Aesthetic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[5%] right-[-5%] w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-[130px]"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-yellow-100/30 rounded-full blur-[110px]"></div>
            </div>

            <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-20 pt-8 pb-20">
                
                {/* Header & Tab Toggle - Reduced Roundness */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        </h1>
                    </div>

                    <div className="inline-flex bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-white shadow-xl">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                                activeTab === 'active' 
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab('cancelled')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                                activeTab === 'cancelled' 
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Cancelled
                        </button>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-40 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl">
                        <FiPackage className="text-7xl text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-800">No orders found</h3>
                        <Link to="/" className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredOrders.map((order) => (
                            <div 
                                key={order.order_id}
                                /* Main Card Roundness adjusted to 3xl */
                                className="group relative bg-white/90 backdrop-blur-md rounded-3xl border border-white p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:-translate-y-3 transition-all duration-500 flex flex-col cursor-default"
                            >
                                {/* Order ID & Icon */}
                                <div className="flex justify-between items-start mb-10">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            <FiHash className="text-emerald-500" /> 
                                            Ref: {order.order_id.slice(-8).toUpperCase()}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <OrderStatusBadge status={order.status} />
                                            <ReturnStatusBadge status={order.return_status} />
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 group-hover:rotate-[360deg]">
                                        <FiPackage className="text-xl" />
                                    </div>
                                </div>

                                {/* Price & Date */}
                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount Paid</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                                <span className="text-sm font-bold text-emerald-600 mr-1">LKR</span>
                                                {parseFloat(order.total_amount).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Placed On</p>
                                            <p className="text-xs font-black text-slate-700">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions - Adjusted Button Roundness */}
                                <div className="mt-auto space-y-3">
                                    <Link
                                        to={`/orders/${order.order_id}`}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-xl shadow-slate-200 hover:shadow-emerald-200 transition-all duration-300"
                                    >
                                        Order Details <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    
                                    <div className="flex gap-3">
                                        {order.status === 1 && activeTab !== 'cancelled' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.order_id)}
                                                className="flex-1 py-3.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-2"
                                            >
                                                <FiXCircle /> Cancel
                                            </button>
                                        )}

                                        {order.status === 4 && activeTab !== 'cancelled' && order.return_status === null && (
                                            <button
                                                onClick={() => handleReturnClick(order)}
                                                className="flex-1 py-3.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 flex items-center justify-center gap-2"
                                            >
                                                <FiRotateCcw /> Return
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showReturnModal && selectedOrder && (
                <ReturnModal
                    orderId={selectedOrder.order_id}
                    shippingId={selectedOrder.shipping_id}
                    onClose={() => setShowReturnModal(false)}
                    onSuccess={handleReturnSuccess}
                />
            )}
        </div>
    );
};

export default OrdersPage;