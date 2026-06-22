import React, { useState, useEffect } from "react";
import { orderApi } from "../services/api";
import { FaBoxOpen, FaRegClock, FaCheckCircle, FaSearch, FaFilter, FaArrowRight } from "react-icons/fa";
import { TbTruckReturn, TbReceipt2, TbCalendarTime, TbMail } from "react-icons/tb";
import { toast } from "react-toastify";
import SellerNavbar from "../layout/SellerNavbar";


const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [returnedOrders, setReturnedOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchOrderData = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getAllOrders();
            const ordersArray = response.data?.data || response.data?.orders || response.data || [];

            const uniqueOrdersMap = new Map();
            ordersArray.forEach(order => {
                if (order.order_id && !uniqueOrdersMap.has(order.order_id)) {
                    uniqueOrdersMap.set(order.order_id, order);
                }
            });

            const uniqueOrders = Array.from(uniqueOrdersMap.values());
            let currentUserId = null;
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    currentUserId = JSON.parse(userStr).user_id;
                } catch (e) { }
            }
            if (!currentUserId) currentUserId = localStorage.getItem('user_id');

            const userOrders = uniqueOrders.filter(order => String(order.user_id) === String(currentUserId));
            const returns = userOrders.filter(order => order.return_status !== null && order.return_status !== undefined);

            setOrders(userOrders);
            setReturnedOrders(returns);
        } catch (error) {
            toast.error('Failed to sync order data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderData();
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const response = await orderApi.cancelOrder(orderId);
            if (response.data.success) {
                toast.success('Order cancelled successfully!');
                fetchOrderData();
            } else {
                toast.error(response.data.message || 'Failed to cancel order');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const filteredData = (view === "all" ? orders : returnedOrders).filter(item =>
        String(item.order_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.email || item.user_email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getOrderStatusBadge = (status) => {
        const statusMap = {
            1: { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-100' },
            2: { label: 'Processing', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            3: { label: 'Shipped', color: 'bg-purple-50 text-purple-600 border-purple-100' },
            4: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            5: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' },
            'pending': { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-100' },
            'processing': { label: 'Processing', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            'shipped': { label: 'Shipped', color: 'bg-purple-50 text-purple-600 border-purple-100' },
            'delivered': { label: 'Delivered', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            'completed': { label: 'Delivered', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            'cancelled': { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' }
        };

        const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
        const config = statusMap[normalizedStatus] || statusMap[1];

        return (
            <span className={`px-3 py-1 rounded-lg text-[11px] font-black border uppercase tracking-wider ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getReturnStatusBadge = (status) => {
        const statusMap = {
            0: { label: 'Return Pending', color: 'bg-amber-50 text-amber-600 border-amber-100' },
            1: { label: 'Return Approved', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            2: { label: 'Return Rejected', color: 'bg-red-50 text-red-600 border-red-100' },
            3: { label: 'Refunded', color: 'bg-blue-50 text-blue-600 border-blue-100' }
        };

        const config = statusMap[status] || statusMap[0];

        return (
            <span className={`px-3 py-1 rounded-lg text-[11px] font-black border uppercase tracking-wider ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const formatAmount = (amount) => {
        const num = parseFloat(amount) || 0;
        return `LKR ${num.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen bg-[#fcfdfe]">
            <SellerNavbar />

            <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>

                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by Order ID or Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                            />
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <FaFilter />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="group relative bg-gradient-to-br from-white to-indigo-50/30 p-6 rounded-3xl border border-indigo-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                <TbReceipt2 size={24} className="drop-shadow-sm" />
                            </div>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">LIVE</span>
                        </div>
                        <p className="text-slate-500 text-sm font-semibold tracking-wide relative z-10">Total Revenue</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight relative z-10">{formatAmount(orders.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0))}</h3>
                    </div>

                    <div className="group relative bg-gradient-to-br from-white to-amber-50/30 p-6 rounded-3xl border border-amber-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-lg shadow-amber-200">
                                <FaRegClock size={20} className="drop-shadow-sm" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-semibold tracking-wide relative z-10">Pending Orders</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight relative z-10">{orders.filter(o => o.status === 1).length}</h3>
                    </div>

                    <div className="group relative bg-gradient-to-br from-white to-emerald-50/30 p-6 rounded-3xl border border-emerald-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
                                <FaCheckCircle size={20} className="drop-shadow-sm" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-semibold tracking-wide relative z-10">Completed Orders</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight relative z-10">{orders.filter(o => o.status === 4).length}</h3>
                    </div>

                    <div className="group relative bg-gradient-to-br from-white to-rose-50/30 p-6 rounded-3xl border border-rose-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200">
                                <TbTruckReturn size={24} className="drop-shadow-sm" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-semibold tracking-wide relative z-10">Total Returns</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight relative z-10">{returnedOrders.length}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[30px] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-50">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                            <button
                                onClick={() => setView("all")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                All Transactions
                            </button>
                            <button
                                onClick={() => setView("returns")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === "returns" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Returns Log
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Updating Records...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Reference</th>
                                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Email</th>
                                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                        {view === "returns" && <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reason</th>}
                                        <th className="px-6 py-5 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item) => (
                                            <tr key={item.order_id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-slate-700 text-sm">#{item.order_id.slice(-8).toUpperCase()}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                        <TbCalendarTime className="text-slate-400" />
                                                        {formatDate(item.order_date || item.created_at || item.date)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                            <TbMail size={18} />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-600">{item.email || item.user_email || 'No Email provided'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {view === "returns"
                                                        ? getReturnStatusBadge(item.return_status)
                                                        : getOrderStatusBadge(item.order_status || item.status)
                                                    }
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-bold text-slate-900">{formatAmount(item.total_amount || item.price || 0)}</span>
                                                </td>
                                                {view === "returns" && (
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm text-slate-500 italic max-w-xs truncate block">"{item.reason || item.return_reason || 'No reason provided'}"</span>
                                                    </td>
                                                )}
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {view === "all" && item.status === 1 && (
                                                            <button
                                                                onClick={() => handleCancelOrder(item.order_id)}
                                                                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                            <FaArrowRight size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={view === "returns" ? 7 : 6} className="py-32 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                                                        <FaBoxOpen size={40} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-400">No records found</h3>
                                                    <p className="text-slate-400 text-sm">Refine your search or check back later.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center text-sm font-medium text-slate-500">
                        <p>Showing {filteredData.length} records</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50" disabled>Previous</button>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;