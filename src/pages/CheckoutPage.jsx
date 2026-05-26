import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import { shippingAddressApi, CartApi, orderApi, userApi, paymentApi } from '../services/api';
import { IoShieldCheckmark, IoCardOutline, IoLocationOutline } from 'react-icons/io5';
import { MdLocalShipping } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CiShoppingCart } from 'react-icons/ci';
import { ArrowLeft } from 'lucide-react';



const BASE_URL = "http://localhost:5000";

const LoadingSpinner = () => (
    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-emerald-600 rounded-full" role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
    </div>
);

const PaymentLoadingModal = ({ isOpen, message }) => {
    if (!isOpen) return null;
    return (
<div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-emerald-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
                    <p className="text-gray-500 text-sm">{message || "Redirecting to secure payment gateway..."}</p>
                </div>
            </div>
        </div>
    );
};
const EditAddressModal = ({ address, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        recipient_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        district: '',
        postal_code: '',
        country: 'Sri Lanka',
        phone_number: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (address) {
            setFormData({
                recipient_name: address.recipient_name || '',
                address_line_1: address.address_line_1 || '',
                address_line_2: address.address_line_2 || '',
                city: address.city || '',
                district: address.district || '',
                postal_code: address.postal_code || '',
                country: address.country || 'Sri Lanka',
                phone_number: address.phone_number || ''
            });
        }
    }, [address]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(address.shipping_id, formData);
            onClose();
        } catch (error) {
            toast.error('Failed to update address');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        /* මෙහි bg-black/20 සහ backdrop-blur-md මගින් පසුබිම Blur කරයි */
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            
            {/* Modal Card එක */}
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Edit Shipping Address</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Recipient Name</label>
                        <input type="text" name="recipient_name" value={formData.recipient_name} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-gray-700" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Address Line 1</label>
                            <input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-gray-700" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Address Line 2</label>
                            <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-gray-700" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-gray-700" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">District</label>
                            <input type="text" name="district" value={formData.district} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-gray-700" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Postal Code</label>
                            <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-gray-700" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-gray-700" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-all uppercase text-xs tracking-widest">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all uppercase text-xs tracking-widest">
                            {loading ? <LoadingSpinner /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [shippingAddresses, setShippingAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [processingOrder, setProcessingOrder] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);


    useEffect(() => {
        console.log("🔴🔴🔴 CHECKING FOR STRIPE RETURN - FULL URL:", window.location.href);

        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const orderId = urlParams.get('order_id');

        console.log("session_id:", sessionId);
        console.log("order_id:", orderId);

        if (sessionId && orderId) {
            console.log("✅✅✅ STRIPE RETURN DETECTED! Clearing cart...");

            const forceClearCart = async () => {
                try {
                    const token = localStorage.getItem('token');

                    const clearResponse = await fetch('http://localhost:5000/api/v1/cart/clear', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log("Cart clear response:", clearResponse.status);

                    localStorage.removeItem('guestCart');
                    localStorage.removeItem('cartItems');
                    sessionStorage.removeItem('pendingCart');
                    sessionStorage.removeItem('pendingOrderId');
                    sessionStorage.removeItem('checkoutCartData');

                    window.dispatchEvent(new Event('cart-updated'));
                    window.dispatchEvent(new CustomEvent('cart-updated'));

                    toast.success('Payment successful! Order confirmed.');

                    
                    setCartItems([]);

                    setTimeout(() => {
                        window.location.href = `/orders/${orderId}`;
                    }, 1000);

                } catch (error) {
                    console.error("Error clearing cart:", error);
                    window.location.href = `/orders/${orderId}`;
                }
            };

            forceClearCart();
        }
    }, []); // Empty dependency array - runs only once


    useEffect(() => {
        console.log("🔴 CheckoutPage mounted - checking URL");
        console.log("Full URL:", window.location.href);

        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const orderId = urlParams.get('order_id');

        console.log("session_id:", sessionId);
        console.log("order_id:", orderId);

        // If we have both session_id and order_id in URL, clear cart
        if (sessionId && orderId) {
            console.log("✅ Stripe return detected! Clearing cart...");

            const clearCartAndRedirect = async () => {
                try {
                    const token = localStorage.getItem('token');

                    // Clear cart from API
                    await fetch('http://localhost:5000/api/v1/cart/clear', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log("Cart cleared from API");

                    // Clear local storage
                    localStorage.removeItem('guestCart');
                    localStorage.removeItem('cartItems');
                    sessionStorage.removeItem('pendingCart');
                    sessionStorage.removeItem('pendingOrderId');
                    sessionStorage.removeItem('checkoutCartData');

                    // Update navbar
                    window.dispatchEvent(new Event('cart-updated'));

                    toast.success('Payment successful!');

                    // Redirect to orders page
                    window.location.href = `/orders/${orderId}`;

                } catch (error) {
                    console.error("Error clearing cart:", error);
                    // Still redirect even if clear fails
                    window.location.href = `/orders/${orderId}`;
                }
            };

            clearCartAndRedirect();
        }
    }, []);

    // SINGLE useEffect for Stripe callback - REMOVE THE DUPLICATE
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const success = urlParams.get('success');
        const canceled = urlParams.get('canceled');

        console.log("🔍 URL CHECK:", { sessionId, success, canceled });

        if (success === 'true' && sessionId) {
            console.log("✅ Payment success! Processing...");
            handleSuccessfulPayment(sessionId);
        }

        if (canceled === 'true') {
            console.log("❌ Payment cancelled");
            toast.info('Payment was cancelled. You can try again.');
            window.history.replaceState({}, document.title, window.location.pathname);
            setPaymentLoading(false);
        }
    }, []);


    // Add this at the top of CheckoutPage component, before any other useEffect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const orderId = urlParams.get('order_id');
        const success = urlParams.get('success');

        console.log("🔴 CHECKPAGE: Checking for Stripe return...");
        console.log("session_id:", sessionId);
        console.log("order_id:", orderId);
        console.log("success:", success);

        // If coming from Stripe success (check for session_id and order_id)
        if (sessionId && orderId) {
            console.log("✅ Stripe return detected in CheckoutPage!");

            const clearCartAndRedirect = async () => {
                const token = localStorage.getItem('token');

                // Clear cart
                await fetch('http://localhost:5000/api/v1/cart/clear', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Clear local storage
                localStorage.removeItem('guestCart');
                localStorage.removeItem('cartItems');
                sessionStorage.removeItem('pendingCart');
                sessionStorage.removeItem('pendingOrderId');

                // Update navbar
                window.dispatchEvent(new Event('cart-updated'));

                toast.success('Payment successful!');

                // Redirect to orders page
                window.location.href = `/orders/${orderId}`;
            };

            clearCartAndRedirect();
        }
    }, []);

    const handleSuccessfulPayment = async (sessionId) => {
        console.log("🔄 Starting payment verification...");
        setPaymentLoading(true);

        try {
            const response = await orderApi.verifyPayment(sessionId);
            console.log("📦 Verification response:", response.data);

            if (response.data.success) {
                console.log("✅ Payment verified! Clearing cart...");

                // Clear cart from API
                await CartApi.clearCart();
                console.log("🗑️ API Cart cleared");

                // Clear localStorage
                localStorage.removeItem('guestCart');
                localStorage.removeItem('cartItems');
                console.log("🗑️ localStorage cleared");

                // Clear sessionStorage
                sessionStorage.removeItem('checkoutCartData');
                sessionStorage.removeItem('pendingOrderId');
                sessionStorage.removeItem('pendingCart');
                console.log("🗑️ sessionStorage cleared");

                // Clear state
                setCartItems([]);

                // Dispatch event to update navbar
                window.dispatchEvent(new CustomEvent('cart-updated'));
                window.dispatchEvent(new Event('cart-updated'));

                toast.success('Payment successful! Order confirmed.');

                // Redirect to orders page
                const orderId = response.data.order_id;
                console.log("🚀 Redirecting to orders page, orderId:", orderId);

                setTimeout(() => {
                    if (orderId) {
                        window.location.href = `/orders/${orderId}`;
                    } else {
                        window.location.href = '/orders';
                    }
                }, 1000);

            } else {
                console.error("Payment verification failed");
                toast.error('Payment verification failed');
                setPaymentLoading(false);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Failed to verify payment. Please check your orders.');
            setPaymentLoading(false);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    const handleAddressUpdate = () => {
        fetchCheckoutData();
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Please login to proceed to checkout.');
            navigate('/login');
            return;
        }

        window.addEventListener('address-updated', handleAddressUpdate);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('user');
            }
        }
        fetchCheckoutData();

        return () => {
            window.removeEventListener('address-updated', handleAddressUpdate);
        };
    }, [navigate]);

    const fetchCheckoutData = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
            toast.warn('Please login to proceed to checkout.');
            navigate('/login');
            return;
        }

        const savedCartData = sessionStorage.getItem('checkoutCartData');
        if (savedCartData) {
            try {
                const parsedCart = JSON.parse(savedCartData);
                if (parsedCart && parsedCart.length > 0) {
                    setCartItems(parsedCart);

                    const userProfileRes = await userApi.getUserProfile();
                    const fetchedUser = userProfileRes.data;
                    setUser(fetchedUser);
                    localStorage.setItem('user', JSON.stringify(fetchedUser));

                    let addresses = [];
                    try {
                        const addressRes = await shippingAddressApi.getShippingAddressesByUserId(fetchedUser.user_id);
                        if (addressRes.data && Array.isArray(addressRes.data)) {
                            addresses = addressRes.data;
                        } else if (addressRes.data && addressRes.data.data && Array.isArray(addressRes.data.data)) {
                            addresses = addressRes.data.data;
                        }
                    } catch (addressError) {
                        console.log("No addresses found");
                    }

                    if (addresses.length === 0) {
                        const defaultAddress = {
                            user_id: fetchedUser.user_id,
                            recipient_name: `${fetchedUser.first_name} ${fetchedUser.last_name}`,
                            address_line_1: fetchedUser.address_line1 || fetchedUser.addree_line1 || "",
                            address_line_2: fetchedUser.address_line2 || "",
                            city: fetchedUser.city || "",
                            district: fetchedUser.district || fetchedUser.disctric || "",
                            postal_code: fetchedUser.postal_code || "",
                            country: fetchedUser.country || "Sri Lanka",
                            phone_number: fetchedUser.mobile_no_1 || "",
                            is_default: true
                        };

                        if (defaultAddress.address_line_1) {
                            const createRes = await shippingAddressApi.createShippingAddress(defaultAddress);
                            if (createRes.data && createRes.data.shipping_id) {
                                addresses = [createRes.data];
                                toast.success("Default shipping address created!");
                            }
                        } else {
                            toast.info("Please add a shipping address to continue");
                            navigate('/shipping-addresses');
                            setLoading(false);
                            return;
                        }
                    }

                    setShippingAddresses(addresses);
                    if (addresses.length > 0) {
                        setSelectedAddress(addresses[0]);
                    }

                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Error parsing saved cart data:", e);
            }
        }

        try {
            const userProfileRes = await userApi.getUserProfile();
            const fetchedUser = userProfileRes.data;
            setUser(fetchedUser);
            localStorage.setItem('user', JSON.stringify(fetchedUser));

            if (!fetchedUser || !fetchedUser.user_id) {
                throw new Error("User data is not available or incomplete after fetching profile.");
            }

            let addresses = [];
            try {
                const addressRes = await shippingAddressApi.getShippingAddressesByUserId(fetchedUser.user_id);
                if (addressRes.data && Array.isArray(addressRes.data)) {
                    addresses = addressRes.data;
                } else if (addressRes.data && addressRes.data.data && Array.isArray(addressRes.data.data)) {
                    addresses = addressRes.data.data;
                } else if (Array.isArray(addressRes)) {
                    addresses = addressRes;
                }
            } catch (addressError) {
                console.log("No addresses found, will create one from profile");
            }

            if (addresses.length === 0) {
                const defaultAddress = {
                    user_id: fetchedUser.user_id,
                    recipient_name: `${fetchedUser.first_name} ${fetchedUser.last_name}`,
                    address_line_1: fetchedUser.addree_line1 || fetchedUser.address_line1 || "",
                    address_line_2: fetchedUser.address_line2 || "",
                    city: fetchedUser.city || "",
                    district: fetchedUser.disctric || fetchedUser.district || "",
                    postal_code: fetchedUser.postal_code || "",
                    country: fetchedUser.country || "Sri Lanka",
                    phone_number: fetchedUser.mobile_no_1 || "",
                    is_default: true
                };

                if (defaultAddress.address_line_1) {
                    const createRes = await shippingAddressApi.createShippingAddress(defaultAddress);
                    if (createRes.data && createRes.data.shipping_id) {
                        addresses = [createRes.data];
                        toast.success("Default shipping address created from your profile!");
                    }
                } else {
                    toast.info("Please add a shipping address to continue");
                    navigate('/shipping-addresses');
                    setLoading(false);
                    return;
                }
            }

            setShippingAddresses(addresses);
            if (addresses.length > 0) {
                setSelectedAddress(addresses[0]);
            }

            const cartRes = await CartApi.getCartItems();
            let cartData = [];
            if (cartRes && cartRes.data) {
                if (Array.isArray(cartRes.data)) {
                    cartData = cartRes.data;
                } else if (cartRes.data.data && Array.isArray(cartRes.data.data)) {
                    cartData = cartRes.data.data;
                } else if (cartRes.data.items && Array.isArray(cartRes.data.items)) {
                    cartData = cartRes.data.items;
                } else if (cartRes.data.cart_items && Array.isArray(cartRes.data.cart_items)) {
                    cartData = cartRes.data.cart_items;
                }
            }

            setCartItems(cartData);

        } catch (err) {
            console.error('Error fetching checkout data:', err);
            setError('Failed to load checkout data. Please try again.');
            toast.error('Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAddress = async (shippingId, formData) => {
        try {
            const response = await shippingAddressApi.updateShippingAddress(shippingId, formData);
            if (response.data.success || response.data.shipping_id) {
                await fetchCheckoutData();
                toast.success('Address updated successfully!');
                window.dispatchEvent(new Event('address-updated'));
                return response.data;
            }
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Failed to update address');
            throw error;
        }
    };

    useEffect(() => {
        const checkForAddressUpdate = () => {
            const addressUpdated = localStorage.getItem('addressUpdated');
            if (addressUpdated === 'true') {
                localStorage.removeItem('addressUpdated');
                fetchCheckoutData();
                toast.success('Shipping address updated!');
            }
        };

        const interval = setInterval(checkForAddressUpdate, 1000);
        return () => clearInterval(interval);
    }, []);

    const calculateSubtotal = () => {
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return 0;
        }
        return cartItems.reduce((sum, item) => {
            const amount = parseFloat(item?.total_amount || 0);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
    };

    const calculateTotalQuantity = () => {
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return 0;
        }
        return cartItems.reduce((sum, item) => {
            const qty = parseInt(item?.qty || 0);
            return sum + (isNaN(qty) ? 0 : qty);
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const finalAmount = subtotal - discountAmount;
    const totalQuantity = calculateTotalQuantity();

    const handleStripePayment = async (orderId) => {
        setPaymentLoading(true);
        sessionStorage.setItem('pendingOrderId', orderId);

        try {
            const response = await paymentApi.createStripeCheckout(orderId);
            const checkoutUrl = response.data?.url || response.data?.checkoutUrl || response.url;

            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (error) {
            console.error('Stripe error:', error);
            toast.error(error.response?.data?.msg || 'Failed to initiate payment. Please try again.');
            setPaymentLoading(false);
            sessionStorage.removeItem('pendingOrderId');
        }
    };


    // Add this as a global check when component mounts
    useEffect(() => {
        // Check if we're returning from Stripe
        if (window.location.search.includes('session_id') && window.location.search.includes('order_id')) {
            const sessionId = new URLSearchParams(window.location.search).get('session_id');
            const orderId = new URLSearchParams(window.location.search).get('order_id');

            console.log("Detected Stripe return! Session:", sessionId, "Order:", orderId);

            // Force clear everything
            const forceClear = async () => {
                const token = localStorage.getItem('token');
                await fetch('http://localhost:5000/api/v1/cart/clear', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = `/orders/${orderId}`;
            };

            forceClear();
        }
    }, []);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a shipping address.');
            return;
        }
        if (!cartItems || cartItems.length === 0) {
            toast.error('Your cart is empty.');
            return;
        }

        setProcessingOrder(true);
        try {
            const orderDetails = {
                user_id: user.user_id,
                shipping_id: selectedAddress.shipping_id,
                cart_items: cartItems.map(item => ({
                    product_id: item.product_id,
                    qty: item.qty
                })),
                payment_method: paymentMethod === 'card' ? 'stripe' : 'cod',
                discount_amount: discountAmount,
            };

            const orderRes = await orderApi.placeOrder(orderDetails);
            const newOrderId = orderRes.data.order_id;

            if (paymentMethod === 'card') {
                sessionStorage.setItem('pendingCart', JSON.stringify(cartItems));
                await handleStripePayment(newOrderId);
            } else {
                await CartApi.clearCart();
                setCartItems([]);
                window.dispatchEvent(new Event('cart-updated'));
                toast.success('Order placed successfully!');
                navigate(`/orders/${newOrderId}`);
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to place order.');
            setProcessingOrder(false);
        }
    };


    // Add this useEffect at the VERY TOP of CheckoutPage component, before any other code
    useEffect(() => {
        console.log("🔴 STRIPE RETURN CHECK - FULL URL:", window.location.href);

        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const success = urlParams.get('success');
        const canceled = urlParams.get('canceled');

        console.log("📋 PARAMS:", { sessionId, success, canceled });

        // If coming from Stripe success
        if (success === 'true' && sessionId) {
            console.log("✅ STRIPE SUCCESS! Processing...");

            // Immediately clear cart and redirect
            const processPayment = async () => {
                try {
                    // Clear cart
                    await CartApi.clearCart();
                    console.log("Cart cleared");

                    // Clear storage
                    localStorage.removeItem('guestCart');
                    localStorage.removeItem('cartItems');
                    sessionStorage.clear();

                    // Update navbar
                    window.dispatchEvent(new Event('cart-updated'));

                    toast.success("Payment successful!");

                    // Redirect to orders page
                    window.location.href = '/orders';

                } catch (error) {
                    console.error("Error processing payment:", error);
                    window.location.href = '/orders';
                }
            };

            processPayment();
        }

        if (canceled === 'true') {
            toast.info("Payment cancelled");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []); // Empty dependency array - runs only once on mount

    const handleApplyCoupon = () => {
        if (couponCode.toUpperCase() === 'FIRSTBUY') {
            setDiscountAmount(100.00);
            toast.success('Coupon applied successfully!');
        } else {
            setDiscountAmount(0);
            toast.error('Invalid coupon code.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
                <p className="ml-2 text-gray-700">Loading checkout data...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-600 text-center mt-8">{error}</div>;
    }

    const isCartEmpty = () => {
        return !cartItems || !Array.isArray(cartItems) || cartItems.length === 0;
    };

    if (isCartEmpty() && !sessionStorage.getItem('checkoutCartData')) {
        return (
            <>
            <Navbar />

                <div className="bg-gray-50 min-h-screen py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
                        <div className="text-gray-600 text-center mt-8 p-6 bg-white rounded-xl shadow-sm">
                            <CiShoppingCart size={50} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-semibold mb-4">Your cart is empty.</p>
                            <button onClick={() => navigate('/')} className="text-blue-600 hover:underline flex items-center justify-center gap-1">
                                <ArrowLeft size={16} /> Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
      <>

                   

    <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />

    <PaymentLoadingModal isOpen={paymentLoading} message="Redirecting to secure payment gateway..." />

    <div className="bg-[#f4fbf6] min-h-screen pb-20 relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[5%] right-[-5%] w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-[130px]"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-yellow-100/30 rounded-full blur-[110px]"></div>
        </div>

        <div className="relative z-10">
               <Navbar />

            <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-10 pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                        <IoLocationOutline size={20} />
                                    </div>
                                    SHIPPING ADDRESS
                                </h2>
                                {selectedAddress && (
                                    <button
                                        onClick={() => { setEditingAddress(selectedAddress); setIsEditModalOpen(true); }}
                                        className="text-xs font-black text-emerald-500 hover:underline tracking-widest"
                                    >
                                        CHANGE ADDRESS
                                    </button>
                                )}
                            </div>

                            {selectedAddress ? (
                                <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl relative">
                                    {selectedAddress.is_default && (
                                        <span className="absolute top-4 right-4 bg-emerald-500 text-[9px] font-black text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            Default
                                        </span>
                                    )}
                                    <p className="font-bold text-gray-900 text-lg mb-1">{selectedAddress.recipient_name}</p>
                                    <p className="text-gray-500 font-medium leading-relaxed text-sm">
                                        {selectedAddress.address_line_1}, {selectedAddress.city}<br />
                                        {selectedAddress.address_line_2 && <>{selectedAddress.address_line_2}<br /></>}
                                        {selectedAddress.district}, {selectedAddress.postal_code}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm">
                                        <span className="text-gray-400 font-bold uppercase text-[10px]">Contact:</span>
                                        <span className="text-gray-800 font-bold">{selectedAddress.phone_number}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <p className="text-gray-400 font-bold mb-4">No address selected</p>
                                    <button onClick={() => navigate('/shipping-addresses')} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md">
                                        Add New Address
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                    <CiShoppingCart size={20} />
                                </div>
                                <h2 className="text-lg font-black text-gray-800 uppercase tracking-wider">ORDER SUMMARY ({cartItems?.length || 0})</h2>
                            </div>

                            <div className="space-y-6">
                                {cartItems?.map((item) => (
                                    <div key={item.cart_id || item.id} className="flex gap-6 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-white p-1">
                                            <img
                                                src={`${BASE_URL}${item.image}`}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="flex-grow pt-1">
                                            <h3 className="text-gray-900 font-bold text-lg leading-tight mb-1">{item.product_name}</h3>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold">Qty: {item.qty}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-xl font-black text-emerald-600">LKR {parseFloat(item.final_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                {item.discount_status === 1 && (
                                                    <p className="text-sm text-gray-300 line-through font-bold">LKR {parseFloat(item.price).toFixed(2)}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right pt-1 hidden sm:block">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Item Total</p>
                                            <p className="text-lg font-black text-gray-800">LKR {parseFloat(item.total_amount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => navigate('/')} className="mt-8 flex items-center gap-2 text-xs font-black text-emerald-500 hover:text-emerald-700 transition-colors uppercase tracking-widest">
                                <ArrowLeft size={16} /> Add more items
                            </button>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight">Payment methods</h2>
                            <div className="space-y-0 border border-gray-100 rounded-xl overflow-hidden">
                                <label className={`flex items-center p-5 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 ${paymentMethod === 'card' ? 'bg-gray-50/80' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        className="w-5 h-5 accent-[#fb7701] mr-4 cursor-pointer"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                    />
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-bold text-gray-800 text-sm sm:text-base tracking-tight">Card</span>
                                        <div className="flex gap-1.5 items-center">
                                            <div className="w-8 h-5 bg-[#1434CB] rounded-sm flex items-center justify-center text-[7px] text-white font-black italic">VISA</div>
                                            <div className="w-8 h-5 bg-[#EB001B] rounded-sm flex items-center justify-center text-[7px] text-white font-black italic">MC</div>
                                            <div className="w-8 h-5 bg-[#0070D1] rounded-sm flex items-center justify-center text-[7px] text-white font-black italic tracking-tighter">AMEX</div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium ml-1">Secure Stripe Checkout</span>
                                    </div>
                                </label>

                                <label className={`flex items-center p-5 cursor-pointer transition-colors hover:bg-gray-50 ${paymentMethod === 'cod' ? 'bg-gray-50/80' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        className="w-5 h-5 accent-[#fb7701] mr-4 cursor-pointer"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800 text-sm sm:text-base tracking-tight">Cash on Delivery</span>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MdLocalShipping size={18} />
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium ml-1">Pay when you receive the order</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-24 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 " />
                            <h2 className="text-xl font-black mb-8 tracking-tight uppercase">Bill Details</h2>

                            <div className="relative mb-8">
                                <input
                                    type="text"
                                    placeholder="Promo Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 focus:ring-1 focus:ring-emerald-500 text-gray-800 font-bold placeholder:text-gray-300 transition-all outline-none"
                                />
                                <button className="absolute right-2 top-2 bottom-2 bg-gray-900 text-white px-5 rounded-lg text-[10px] font-black uppercase hover:bg-black transition-colors tracking-widest">
                                    Apply
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500 font-bold text-sm">
                                    <span>Subtotal ({totalQuantity} items)</span>
                                    <span className="text-gray-900">LKR {subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-rose-500 font-bold text-sm">
                                        <span>Discount</span>
                                        <span>- LKR {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-gray-500 font-bold text-sm">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-black">FREE</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t-2 border-dashed border-gray-100 mb-8">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Total Payable</p>
                                <p className="text-3xl font-black text-emerald-600 tracking-tighter">LKR {finalAmount.toLocaleString()}</p>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={processingOrder || paymentLoading || !selectedAddress || !paymentMethod}
                                className="w-full bg-emerald-500 text-white py-5 rounded-2xl text-lg font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 uppercase tracking-wider"
                            >
                                {processingOrder ? 'Processing...' : (paymentMethod === 'card' ? 'Pay Now' : 'Place Order')}
                            </button>

                            <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                    <IoShieldCheckmark size={18} className="text-emerald-500" />
                                    100% Secure Checkout
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed">
                                    By placing your order, you agree to ShopEase <a href="#" className="underline">Terms</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <EditAddressModal
        address={editingAddress}
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingAddress(null); fetchCheckoutData(); }}
        onSave={handleUpdateAddress}
    />
</>
    );
};

export default CheckoutPage;