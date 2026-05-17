import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi, productImageApi } from '../services/api';
import Navbar from '../layout/Navbar';
import { toast } from 'react-toastify';
import { 
    FiPackage, FiMapPin, FiCreditCard, FiArrowLeft, 
    FiPrinter, FiInfo, FiCalendar, FiCheckCircle
} from 'react-icons/fi';

const BASE_URL = "http://localhost:5000";

const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-800 mb-4"></div>
    </div>
);

const OrderStatusBadge = ({ status }) => {
    const statusMap = {
        1: { label: 'Pending', bg: 'bg-slate-100', text: 'text-slate-600' },
        2: { label: 'Processing', bg: 'bg-blue-50', text: 'text-blue-600' },
        3: { label: 'Shipped', bg: 'bg-indigo-50', text: 'text-indigo-600' },
        4: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        5: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-600' },
    };
    const current = statusMap[status] || statusMap[1];
    return (
        <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${current.bg} ${current.text} border border-current/10`}>
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
        <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-900">
            <Navbar />
            
            <div className="container mx-auto px-4 py-12">
                 <div className="fixed inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 z-0"></div>
            </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="space-y-1">
                        <button onClick={() => navigate('/orders')} className="flex items-center text-xs font-bold text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest mb-4">
                            <FiArrowLeft className="mr-2" /> Back to My Orders
                        </button>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Order ID: <span className="text-slate-500 font-medium">#{order.order_id}</span></h1>
                        <div className="flex items-center gap-3 pt-1">
                            <OrderStatusBadge status={order.status} />
                            <span className="text-slate-300">|</span>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                <FiCalendar className="text-slate-400" /> {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <FiPrinter /> Export Invoice
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200">
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Items in your shipment</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {items.map((item, idx) => (
                                    <div key={idx} className="p-6 flex items-center gap-6 group">
                                        <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 transition-transform group-hover:scale-105">
                                            <img 
                                                src={getProductImageUrl(item.product_image) || "https://via.placeholder.com/150"} 
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-bold text-slate-900 truncate">{item.product_name}</h3>
                                            <p className="text-sm text-slate-500 mt-0.5 font-medium">Qty: {item.qty} × LKR {parseFloat(item.price_at_order).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">LKR {parseFloat(item.item_total).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-slate-400">
                                    <FiMapPin size={14} />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest">Shipping Destination</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 text-lg">{order.recipient_name}</p>
                                    <div className="text-sm text-slate-500 leading-relaxed font-medium">
                                        <p>{order.address_line_1}</p>
                                        {order.address_line_2 && <p>{order.address_line_2}</p>}
                                        <p>{order.city}, {order.district}</p>
                                        <p className="mt-2 text-slate-900">{order.phone_number}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg shadow-slate-200 overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                                        <FiCreditCard size={14} />
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Payment Metadata</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-slate-400">Transaction Status</p>
                                            <p className={`text-sm font-black mt-1 ${payments[0]?.status === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {payments[0]?.status === 2 ? 'VERIFIED SUCCESS' : 'PENDING APPROVAL'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Billed via</p>
                                            <p className="text-sm font-bold">Credit/Debit Gateway</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sticky top-10">
                            <h2 className="text-lg font-black text-slate-900 mb-6">Financial Summary</h2>
                            
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">LKR {(parseFloat(order.total_amount) + parseFloat(order.discount || 0)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-bold">LKR 0.00</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between items-center bg-red-50/50 p-3 rounded-lg text-red-600 border border-red-100">
                                        <span className="flex items-center gap-2 font-bold"><FiTag /> Discount</span>
                                        <span className="font-black">- LKR {parseFloat(order.discount).toLocaleString()}</span>
                                    </div>
                                )}
                                
                                <div className="pt-6 mt-6 border-t border-slate-100">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount to Pay</span>
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                                                <span className="text-lg font-bold mr-1.5">LKR</span>
                                                {parseFloat(order.total_amount).toLocaleString()}
                                            </h3>       
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50">
                                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                                    <FiCheckCircle /> Confirm Delivery
                                </button>
                                <div className="flex items-center gap-2 mt-6 p-4 bg-slate-50 rounded-lg text-slate-500">
                                    <FiInfo className="flex-shrink-0" size={14} />
                                    <p className="text-[11px] leading-relaxed font-medium">
                                        Our returns policy lasts 30 days. For any issues with this order, please contact help@support.com.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;