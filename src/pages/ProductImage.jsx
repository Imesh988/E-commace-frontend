import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../services/api';
import Navbar from '../layout/Navbar';
import { toast } from 'react-toastify';

const BASE_URL = "http://localhost:5000";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
    </div>
);

const OrderStatusBadge = ({ status }) => {
    const statusConfig = {
        1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
        2: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
        3: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: '📦' },
        4: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
        5: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    const config = statusConfig[status] || statusConfig[1];
    return (
        <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${config.color}`}>
            <span className="mr-1">{config.icon}</span> {config.label}
        </span>
    );
};

const PaymentStatusBadge = ({ status }) => {
    const statusConfig = {
        1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        2: { label: 'Paid', color: 'bg-green-100 text-green-800' },
        3: { label: 'Failed', color: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status] || statusConfig[1];
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
            {config.label}
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
            console.log('Order details:', response.data);
            
            if (response.data) {
                setOrder(response.data.order);
                setItems(response.data.items || []);
                setPayments(response.data.payments || []);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to load order details');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Demo Image Generator - No more undefined errors
    const getProductImageUrl = (item) => {
        // First check if product_image exists
        if (item.product_image && item.product_image !== 'undefined' && item.product_image !== 'null') {
            const imagePath = item.product_image;
            const imageUrl = `${BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
            return imageUrl;
        }
        
        // If no image, generate a demo image based on product name
        const colors = ['4F46E5', '10B981', 'F59E0B', 'EF4444', '8B5CF6', 'EC4899', '06B6D4'];
        const colorIndex = (item.product_id || item.product_name?.length || 0) % colors.length;
        const text = item.product_name?.charAt(0)?.toUpperCase() || 'P';
        return `https://via.placeholder.com/80/${colors[colorIndex]}/ffffff?text=${text}`;
    };

    if (loading) return <LoadingSpinner />;
    if (!order) return null;

    return (
        <>
            <Navbar />
            <div className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate('/orders')}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Orders
                    </button>

                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h1>
                                <p className="font-mono text-sm text-gray-500">Order ID: {order.order_id}</p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6 text-sm">
                            <div>
                                <p className="text-gray-500">Placed on</p>
                                <p className="font-medium text-gray-700">{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Items</p>
                                <p className="font-medium text-gray-700">{order.qty} items</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Payment Status</p>
                                <PaymentStatusBadge status={payments[0]?.status || 1} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No items found</p>
                            ) : (
                                items.map((item, index) => (
                                    <div key={item.order_item_id || item.id || index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={getProductImageUrl(item)}
                                                alt={item.product_name || 'Product'}
                                                className="w-full h-full object-cover rounded-lg"
                                                onError={(e) => {
                                                    console.log('Image error for:', item.product_name);
                                                    e.target.src = `https://via.placeholder.com/80/4F46E5/ffffff?text=${(item.product_name?.charAt(0) || 'P')}`;
                                                }}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800">{item.product_name || 'Product'}</h3>
                                            <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                                            <p className="text-sm text-gray-500">Price: LKR {parseFloat(item.price_at_order).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600">LKR {parseFloat(item.item_total).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold text-gray-800">{order.recipient_name}</p>
                            <p className="text-gray-600 mt-1">{order.address_line_1}</p>
                            {order.address_line_2 && <p className="text-gray-600">{order.address_line_2}</p>}
                            <p className="text-gray-600">{order.city}, {order.district}</p>
                            <p className="text-gray-600">{order.postal_code}, {order.country}</p>
                            <p className="text-gray-600 mt-2">Phone: {order.phone_number}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-800">LKR {(parseFloat(order.total_amount) + parseFloat(order.discount || 0)).toLocaleString()}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="text-red-500">- LKR {parseFloat(order.discount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-3 border-t border-gray-200">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-emerald-600">LKR {parseFloat(order.total_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetailsPage;