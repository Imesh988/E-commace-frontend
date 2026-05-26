// --- START OF FILE Paste March 17, 2026 - 1:55PM ---

import React, { useEffect, useState } from 'react';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { IoFlashOutline, IoTimerOutline } from 'react-icons/io5';
import { MdLocalShipping, MdVerified, MdSecurity } from 'react-icons/md';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import AfterNavbar from '../layout/AfterNavbar';
import { CartApi } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../layout/Navbar';



const BASE_URL = "http://localhost:5000";

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [selectAll, setSelectAll] = useState(true);
    const [selectedItems, setSelectedItems] = useState({});

    useEffect(() => {
        fetchCartItems();
    }, []);

    useEffect(() => {
        // Initialize selected items when cart loads
        const initialSelected = {};
        cartItems.forEach(item => {
            initialSelected[item.cart_id] = true;
        });
        setSelectedItems(initialSelected);
    }, [cartItems]);

    const fetchCartItems = async () => {
        setLoading(true);
        const token = localStorage.getItem('token'); // Get the token here

        try {
            if (token) {
                // User is logged in, fetch from API
                const response = await CartApi.getCartItems();
                setCartItems(response.data.data || []);
            } else {
                // User is a guest, load from localStorage
                const savedGuestCart = localStorage.getItem('guestCart');
                setCartItems(savedGuestCart ? JSON.parse(savedGuestCart) : []);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            toast.error('Failed to load cart');
            setCartItems([]); // Ensure cart is empty on error
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (item, newQty) => {
        if (newQty < 1) return;

        const token = localStorage.getItem('token'); // Check token here too
        
        try {
            setUpdating(prev => ({ ...prev, [item.cart_id]: true }));
            
            const newTotal = parseFloat(item.final_price) * newQty;
            
            if (token) {
                await CartApi.updateCartItem(item.cart_id, { qty: newQty, totalAmount: newTotal });
                // Re-fetch to ensure consistency with backend
                await fetchCartItems(); 
            } else {
                // Update guest cart in state and localStorage
                const updatedGuestCart = cartItems.map(cartItem =>
                    cartItem.cart_id === item.cart_id
                        ? { ...cartItem, qty: newQty, total_amount: newTotal }
                        : cartItem
                );
                setCartItems(updatedGuestCart);
                localStorage.setItem('guestCart', JSON.stringify(updatedGuestCart));
            }

        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
        } finally {
            setUpdating(prev => ({ ...prev, [item.cart_id]: false }));
        }
    };

    const handleRemoveItem = async (cartId) => {
        const token = localStorage.getItem('token'); // Check token here too

        try {
            if (token) {
                await CartApi.removeCartItem(cartId);
                // Re-fetch to ensure consistency with backend
                await fetchCartItems();
            } else {
                // Update guest cart in state and localStorage
                const updatedGuestCart = cartItems.filter(item => item.cart_id !== cartId);
                setCartItems(updatedGuestCart);
                localStorage.setItem('guestCart', JSON.stringify(updatedGuestCart));
            }
            toast.success('Item removed');
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        }
    };

    const handleSelectItem = (cartId) => {
        setSelectedItems(prev => ({
            ...prev,
            [cartId]: !prev[cartId]
        }));
        
        // Update select all status
        const allSelected = cartItems.every(item => 
            item.cart_id === cartId ? !prev[cartId] : prev[item.cart_id]
        );
        setSelectAll(allSelected);
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        
        const newSelected = {};
        cartItems.forEach(item => {
            newSelected[item.cart_id] = newSelectAll;
        });
        setSelectedItems(newSelected);
    };

    const calculateSelectedSubtotal = () => {
        return cartItems
            .filter(item => selectedItems[item.cart_id])
            .reduce((sum, item) => sum + parseFloat(item.total_amount), 0)
            .toFixed(2);
    };

    const selectedCount = cartItems.filter(item => selectedItems[item.cart_id]).length;

    const handleContinueShopping = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <>
                
                <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-yellow-50 font-sans overflow-hidden">
                    <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0"></div>
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 z-0"></div>
                    <div className="absolute bottom-1/4 right-1/2 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                    
                    <div className="relative z-10 min-h-screen flex items-center justify-center">
                        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your cart...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            
           
            {/* User Dashboard Style Background */}
            <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-yellow-50 font-sans overflow-hidden">
                {/* Animated Blobs */}
                <div className="absolute top-0 left-0 w-90 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 z-0"></div>
                <div className="absolute bottom-1/4 right-1/2 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                 <Navbar />
                {/* Main Content */}
                <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header with breadcrumb - Styled like dashboard */}
                    <div className="mb-6 relative z-10">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span 
                                className="hover:text-emerald-600 cursor-pointer transition-colors" 
                                onClick={handleContinueShopping}
                            >
                                Home
                            </span>
                            <span>/</span>
                            <span className="text-emerald-700 font-medium">Shopping Cart</span>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 z-0"></div>
                            <h1 className="relative z-10 text-3xl font-bold text-gray-800 flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-emerald-100">
                                <FiShoppingBag className="text-emerald-600" />
                                My Cart
                                {cartItems.length > 0 && (
                                    <span className="text-sm font-normal text-gray-500 ml-2 bg-white px-3 py-1 rounded-full">
                                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-12 text-center">
                            <div className="absolute -top-10 -left-1- w-48 h-48 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 z-0"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 z-0"></div>
                            
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiShoppingBag className="text-4xl text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
                                <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
                                <button 
                                    onClick={handleContinueShopping}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Lightning Deal Banner - Styled */}
                                <div className="relative z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <IoFlashOutline className="text-2xl" />
                                            <div>
                                                <h3 className="font-bold">Lightning Deals</h3>
                                                <p className="text-sm opacity-90">Limited time offers. Grab them fast!</p>
                                            </div>
                                        </div>
                                        {/* <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                            <IoTimerOutline />
                                            <span className="text-sm font-medium">02:15:30</span>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Select All Bar - Styled */}
                                <div className="relative z-10 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-emerald-100 flex items-center justify-between">
                                    <label className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="text-gray-700">Select all ({cartItems.length} items)</span>
                                    </label>
                                    <button className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                                        Delete selected
                                    </button>
                                </div>

                                {/* Cart Items */}
                                {cartItems.map((item) => (
                                    <div key={item.cart_id} className="relative z-10 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 border border-emerald-100">
                                        <div className="flex gap-4">
                                            {/* Checkbox */}
                                            <div className="pt-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedItems[item.cart_id] || false}
                                                    onChange={() => handleSelectItem(item.cart_id)}
                                                    className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                                />
                                            </div>

                                            {/* Product Image */}
                                            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-50 to-yellow-50 rounded-lg overflow-hidden flex-shrink-0 border border-emerald-200 shadow-sm">
                                                {item.image ? (
                                                    <img
                                                        src={`${BASE_URL}${item.image.startsWith('/') ? item.image : `/${item.image}`}`}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/100?text=No+Image";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                                        No image
                                                    </div>
                                                )}
                                                {/* Lightning Deal Badge */}
                                                {Math.random() > 0.5 && (
                                                    <div className="absolute top-1 left-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                                                        <IoFlashOutline size={12} />
                                                        <span>Deal</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <h3 className="font-medium text-gray-800 hover:text-emerald-600 cursor-pointer line-clamp-2 flex-1">
                                                        {item.product_name}
                                                    </h3>
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.cart_id)}
                                                        className="text-gray-400 hover:text-red-500 ml-2 transition-colors"
                                                        title="Remove"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                                
                                                {/* Price Section */}
                                                <div className="mt-2">
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-xl font-bold text-emerald-600">
                                                            LKR {parseFloat(item.final_price).toFixed(2)}
                                                        </p>
                                                        {item.discount_status === 1 && (
                                                            <p className="text-sm text-gray-400 line-through">
                                                                LKR {parseFloat(item.price).toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {item.discount_status === 1 && (
                                                        <p className="text-xs text-orange-500 font-medium mt-1">
                                                            You save: LKR {(parseFloat(item.price) - parseFloat(item.final_price)).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Free Shipping Tag */}
                                                {/* <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                                    <MdLocalShipping className="text-emerald-600" />
                                                    <span>Free shipping</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="text-emerald-600">In stock</span>
                                                </div> */}

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center border border-emerald-200 rounded-lg bg-white">
                                                        <button
                                                            onClick={() => handleQuantityChange(item, item.qty - 1)}
                                                            disabled={updating[item.cart_id] || item.qty <= 1}
                                                            className="w-10 h-10 flex items-center justify-center text-lg hover:bg-emerald-50 disabled:opacity-30 rounded-l-lg transition-colors"
                                                        >
                                                            <FiMinus size={16} />
                                                        </button>
                                                        
                                                        <span className="w-12 text-center font-medium">
                                                            {updating[item.cart_id] ? (
                                                                <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                                                            ) : (
                                                                item.qty
                                                            )}
                                                        </span>
                                                        
                                                        <button
                                                            onClick={() => handleQuantityChange(item, item.qty + 1)}
                                                            disabled={updating[item.cart_id]}
                                                            className="w-10 h-10 flex items-center justify-center text-lg hover:bg-emerald-50 disabled:opacity-30 rounded-r-lg transition-colors"
                                                        >
                                                            <FiPlus size={16} />
                                                        </button>
                                                    </div>

                                                    {/* <button className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm transition-colors">
                                                        <FiHeart size={16} />
                                                        <span className="hidden sm:inline">Save for later</span>
                                                    </button> */}
                                                </div>
                                            </div>

                                            {/* Item Total - Desktop */}
                                            <div className="hidden md:block text-right min-w-[100px]">
                                                <p className="text-sm text-gray-500 mb-1">Item Total</p>
                                                <p className="font-bold text-lg text-emerald-600">
                                                    LKR {parseFloat(item.total_amount).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Item Total - Mobile */}
                                        <div className="md:hidden mt-3 pt-3 border-t border-emerald-100 flex justify-between items-center">
                                            <p className="text-sm text-gray-500">Item Total</p>
                                            <p className="font-bold text-lg text-emerald-600">
                                                LKR {parseFloat(item.total_amount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Continue Shopping Link */}
                                <div className="flex justify-center pt-4">
                                    <button 
                                        onClick={handleContinueShopping}
                                        className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors bg-white/60 backdrop-blur-sm px-100 py-2 rounded-full shadow-sm hover:shadow-md"
                                    >
                                        <span>←</span> Continue Shopping
                                    </button>
                                </div>
                            </div>

                            {/* Right Column - Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 sticky top-24 border border-emerald-100">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
                                    
                                    <div className="relative z-10">
                                        <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
                                        
                                        {/* Free Shipping Banner */}
                                        {/* <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg mb-4 flex items-center gap-2 border border-blue-200">
                                            <MdLocalShipping className="text-blue-600 text-xl" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">Free Shipping</p>
                                                <p className="text-xs text-blue-500">For orders over LKR 5,000</p>
                                            </div>
                                        </div> */}

                                        {/* Price Breakdown */}
                                        <div className="space-y-3 text-sm mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal ({selectedCount} items)</span>
                                                <span className="font-medium">LKR {calculateSelectedSubtotal()}</span>
                                            </div>
                                           
                                            {/* <div className="flex justify-between">
                                                <span className="text-gray-600">Estimated Tax</span>
                                                <span className="font-medium">LKR 0.00</span>
                                            </div> */}
                                            <div className="border-t border-emerald-200 pt-3 mt-3">
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-emerald-600">LKR {calculateSelectedSubtotal()}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                                            </div>
                                        </div>

                                        {/* Almost Sold Out Warning */}
                                        {selectedCount > 0 && (
                                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg mb-4 flex items-center gap-2 border border-orange-200">
                                                <IoFlashOutline className="text-orange-600 text-xl" />
                                                <p className="text-sm text-orange-600">
                                                    <span className="font-bold">Almost sold out!</span> Complete your purchase soon.
                                                </p>
                                            </div>
                                        )}

                                        {/* Checkout Button */}
                                        <button 
                                            disabled={selectedCount === 0}
                                            className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg mb-3 ${
                                                selectedCount > 0 
                                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-xl hover:scale-105' 
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Proceed to Checkout {selectedCount > 0 && `(${selectedCount})`}
                                        </button>

                                        {/* Payment Icons */}
                                        <div className="flex items-center justify-center gap-4 text-gray-400 text-2xl mt-4">
                                            <RiMoneyDollarCircleLine className="hover:text-emerald-600 transition-colors" />
                                            <MdSecurity className="hover:text-emerald-600 transition-colors" />
                                            <MdVerified className="hover:text-emerald-600 transition-colors" />
                                        </div>
                                        <p className="text-xs text-center text-gray-500 mt-2">
                                            Secure payment • 30-day returns
                                        </p>

                                        {/* Coupon Section */}
                                        {/* <div className="mt-4 pt-4 border-t border-emerald-200">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Have a coupon?</p>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter code"
                                                    className="flex-1 px-3 py-2 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/50"
                                                />
                                                <button className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:from-emerald-200 hover:to-emerald-100 transition-all">
                                                    Apply
                                                </button>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
};

export default CartPage;