import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi, productImageApi } from '../services/api';
import { toast } from 'react-toastify';
import { 
    FiPackage, FiMapPin, FiCreditCard, FiArrowLeft, 
    FiPrinter, FiInfo, FiCalendar, FiCheckCircle,
    FiTruck, FiClock, FiDollarSign, FiTag, FiUser
} from 'react-icons/fi';
import Navbar from '../layout/Navbar';

const BASE_URL = "http://localhost:5000";

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Loading order details...</p>
    </div>
);

const OrderStatusBadge = ({ status }) => {
    const statusMap = {
        1: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', icon: FiClock, border: 'border-amber-200' },
        2: { label: 'Processing', bg: 'bg-blue-50', text: 'text-blue-700', icon: FiPackage, border: 'border-blue-200' },
        3: { label: 'Shipped', bg: 'bg-indigo-50', text: 'text-indigo-700', icon: FiTruck, border: 'border-indigo-200' },
        4: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: FiCheckCircle, border: 'border-emerald-200' },
        5: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', icon: FiInfo, border: 'border-rose-200' },
    };
    const current = statusMap[status] || statusMap[1];
    const Icon = current.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${current.bg} ${current.text} border ${current.border}`}>
            <Icon size={14} />
            {current.label}
        </span>
    );
};

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingImages, setLoadingImages] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Please login to view order details');
            navigate('/login');
            return;
        }
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await orderApi.getOrderDetails(orderId);
            if (response.data) {
                setOrder(response.data.order);
                const itemsData = response.data.items || [];
                setItems(itemsData);
                setPayments(response.data.payments || []);
                await fetchImagesForItems(itemsData);
            }
        } catch (error) {
            toast.error('Failed to load order details');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchImagesForItems = async (itemsData) => {
        const updatedItems = [...itemsData];
        for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i];
            const productId = item.product_id;
            setLoadingImages(prev => ({ ...prev, [productId]: true }));
            try {
                const response = await productImageApi.getProductImagesByProductId(productId);
                const imagesData = response.data?.data || response.data || [];
                if (imagesData && imagesData.length > 0) {
                    const primaryImage = imagesData.find(img => img.is_primary === 1) || imagesData[0];
                    updatedItems[i] = { ...item, product_image: primaryImage.image };
                }
            } catch (error) { console.error(error); }
            finally { setLoadingImages(prev => ({ ...prev, [productId]: false })); }
        }
        setItems(updatedItems);
    };

    const getProductImageUrl = (imagePath) => {
        if (!imagePath || imagePath === 'null') return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
    };

    if (loading) return <LoadingSpinner />;
    if (!order) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/30 font-sans antialiased relative overflow-hidden">
            {/* Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[5%] right-[-5%] w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-[130px]"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-yellow-100/30 rounded-full blur-[110px]"></div>
            </div>

            <Navbar />

            <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Header Section */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate('/orders')}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-all duration-200 mb-4"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" size={16} />
                        Back to Orders
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    Order <span className="text-emerald-600">#{order.order_id}</span>
                                </h1>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <FiCalendar size={14} className="text-slate-400" />
                                    {new Date(order.created_at).toLocaleDateString('en-US', { 
                                        month: 'long', 
                                        day: 'numeric', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                                <span className="w-px h-4 bg-slate-200"></span>
                                <span className="flex items-center gap-1.5">
                                    <FiPackage size={14} className="text-slate-400" />
                                    {items.length} {items.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <FiPrinter size={16} />
                            Print Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Items Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/50 to-transparent border-b border-emerald-100/30">
                                <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <FiPackage size={14} />
                                    Order Items
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-100/80">
                                {items.map((item, idx) => (
                                    <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors duration-200">
                                        <div className="flex items-center gap-5">
                                            <div className="relative w-20 h-20 flex-shrink-0">
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 to-amber-100/40 rounded-xl transform rotate-3"></div>
                                                <img
                                                    src={getProductImageUrl(item.product_image) || "https://via.placeholder.com/150"}
                                                    alt={item.product_name}
                                                    className="relative w-full h-full object-cover rounded-xl shadow-sm border border-white/60"
                                                    onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Image"}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                                                    {item.product_name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm">
                                                    <span className="text-slate-500">Qty: <span className="font-semibold text-slate-700">{item.qty}</span></span>
                                                    <span className="w-px h-3 bg-slate-200"></span>
                                                    <span className="text-slate-500">× LKR {parseFloat(item.price_at_order).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-lg font-extrabold text-emerald-600">
                                                    LKR {parseFloat(item.item_total).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping & Payment Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Card */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-emerald-100/50 rounded-xl">
                                        <FiMapPin className="text-emerald-600" size={16} />
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">Shipping Address</h3>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="font-bold text-slate-900 text-lg">{order.recipient_name}</p>
                                    <div className="text-sm text-slate-600 leading-relaxed space-y-0.5">
                                        <p>{order.address_line_1}</p>
                                        {order.address_line_2 && <p>{order.address_line_2}</p>}
                                        <p>{order.city}, {order.district}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                        <FiUser size={14} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700">{order.phone_number}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Card */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg shadow-slate-200/50 p-6 text-white relative overflow-hidden">
                                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                            <FiCreditCard className="text-emerald-400" size={16} />
                                        </div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Payment Details</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Status</p>
                                            <p className={`text-sm font-bold mt-1 ${
                                                payments[0]?.status === 2 ? 'text-emerald-400' : 'text-amber-400'
                                            }`}>
                                                {payments[0]?.status === 2 ? '✅ Verified Success' : '⏳ Pending Approval'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Method</p>
                                            <p className="text-sm font-bold text-white">Credit / Debit Card</p>
                                        </div>
                                        <div className="pt-3 border-t border-white/10">
                                            <p className="text-xs text-slate-400 font-medium">Reference</p>
                                            <p className="text-sm font-mono text-slate-300 truncate">
                                                {order.order_id}-{Date.now().toString().slice(-6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 lg:p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-emerald-100/50 rounded-xl">
                                        <FiDollarSign className="text-emerald-600" size={16} />
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-[0.15em]">Financial Summary</h2>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-slate-100/50">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-semibold text-slate-800">
                                            LKR {(parseFloat(order.total_amount) + parseFloat(order.discount || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100/50">
                                        <span className="text-slate-500">Shipping</span>
                                        <span className="font-semibold text-emerald-600">FREE</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between py-2 border-b border-slate-100/50 bg-rose-50/50 -mx-2 px-2 rounded-lg">
                                            <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                                                <FiTag size={14} /> Discount
                                            </span>
                                            <span className="font-bold text-rose-600">- LKR {parseFloat(order.discount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 mt-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Total Amount</span>
                                            <div className="text-right">
                                                <span className="text-sm font-medium text-slate-500 mr-1">LKR</span>
                                                <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                                                    {parseFloat(order.total_amount).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 text-right">Inclusive of all taxes</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100/80 space-y-3">
                                    <button className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
                                        <FiCheckCircle size={18} />
                                        Confirm Delivery
                                    </button>
                                    <div className="flex items-start gap-2.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                                        <FiInfo className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} />
                                        <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                            Need help? Our support team is available 24/7. 
                                            <span className="block text-emerald-600 font-semibold mt-0.5">help@shopease.com</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="mt-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 p-4 flex items-center gap-3">
                                <div className="p-2 bg-emerald-100/40 rounded-full">
                                    <FiTruck className="text-emerald-600" size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Delivery</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 10s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default OrderDetailsPage;