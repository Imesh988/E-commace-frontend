import React, { useEffect, useState } from 'react';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft, FiShield, FiTruck } from 'react-icons/fi';
import { IoFlashOutline, IoTimerOutline, IoBagCheckOutline } from 'react-icons/io5';
import { MdVerified, MdOutlinePayments } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
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
        const initialSelected = {};
        cartItems.forEach(item => {
            initialSelected[item.cart_id] = true;
        });
        setSelectedItems(initialSelected);
    }, [cartItems]);

    const fetchCartItems = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            if (token) {
                const response = await CartApi.getCartItems();
                setCartItems(response.data.data || []);
            } else {
                const savedGuestCart = localStorage.getItem('guestCart');
                setCartItems(savedGuestCart ? JSON.parse(savedGuestCart) : []);
            }
        } catch (error) {
            toast.error('Failed to load cart');
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (item, newQty) => {
        if (newQty < 1) return;
        const token = localStorage.getItem('token');
        try {
            setUpdating(prev => ({ ...prev, [item.cart_id]: true }));
            const newTotal = parseFloat(item.final_price) * newQty;

            if (token) {
                await CartApi.updateCartItem(item.cart_id, { qty: newQty, totalAmount: newTotal });
                await fetchCartItems();
            } else {
                const updatedGuestCart = cartItems.map(cartItem =>
                    cartItem.cart_id === item.cart_id
                        ? { ...cartItem, qty: newQty, total_amount: newTotal }
                        : cartItem
                );
                setCartItems(updatedGuestCart);
                localStorage.setItem('guestCart', JSON.stringify(updatedGuestCart));
            }
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setUpdating(prev => ({ ...prev, [item.cart_id]: false }));
        }
    };

    const handleRemoveItem = async (cartId) => {
        const token = localStorage.getItem('token');
        try {
            if (token) {
                await CartApi.removeCartItem(cartId);
                await fetchCartItems();
            } else {
                const updatedGuestCart = cartItems.filter(item => item.cart_id !== cartId);
                setCartItems(updatedGuestCart);
                localStorage.setItem('guestCart', JSON.stringify(updatedGuestCart));
            }
            toast.success('Item removed');
        } catch (error) {
            toast.error('Removal failed');
        }
    };

    const handleSelectItem = (cartId) => {
        setSelectedItems(prev => {
            const newState = { ...prev, [cartId]: !prev[cartId] };
            const allSelected = cartItems.every(item => newState[item.cart_id]);
            setSelectAll(allSelected);
            return newState;
        });
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

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc]">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
            <div className="bg-[#f4fbf6] min-h-screen pb-20 relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[5%] right-[-5%] w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-[130px]"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-yellow-100/30 rounded-full blur-[110px]"></div>
        </div>
            <Navbar />

            {/* Main Content Area */}
            <main className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-20 py-8">
                
                {/* Upper Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <button 
                            onClick={() => navigate('/')}
                            className="group flex items-center text-xs font-bold text-emerald-600 mb-1 hover:text-emerald-700 transition-all"
                        >
                            <FiArrowLeft className="mr-1.5" /> Back to Dashboard
                        </button>

                    </div>

                    {cartItems.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-3 px-5 rounded-[20px] shadow-lg shadow-emerald-900/5 flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Items</span>
                                <span className="text-base font-extrabold text-slate-800">{cartItems.length}</span>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-150"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subtotal</span>
                                <span className="text-base font-extrabold text-emerald-600">LKR {calculateSelectedSubtotal()}</span>
                            </div>
                        </div>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-24 bg-white/40 backdrop-blur-md rounded-[40px] border border-white">
                        <FiShoppingBag className="text-7xl text-emerald-200 mb-4 animate-bounce" />
                        <h2 className="text-xl font-bold text-slate-700">Your bag is empty</h2>
                        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-full font-bold shadow-lg text-sm">Start Shopping</button>
                    </div>
                ) : (
                    <div className="flex flex-col xl:flex-row gap-6">
                        
                        {/* Left Side: Items List (More compact cards) */}
                        <div className="flex-1 space-y-3">
                            {/* Select All Bar */}
                            <div className="w-full bg-white/60 backdrop-blur-md border border-white rounded-[20px] p-3 px-4 flex items-center justify-between">
                                <label className="flex items-center gap-2.5 cursor-pointer ml-2">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="font-bold text-sm text-slate-700">Select All ({cartItems.length})</span>
                                </label>
                                <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50/60 px-3 py-1 rounded-full">
                                    <IoTimerOutline className="animate-spin-slow text-sm" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Offers end soon!</span>
                                </div>
                            </div>

                            {/* Items Container */}
                            <div className="grid grid-cols-1 gap-3">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.cart_id}
                                        className="w-full bg-white/80 backdrop-blur-md border border-white rounded-[24px] p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems[item.cart_id] || false}
                                                onChange={() => handleSelectItem(item.cart_id)}
                                                className="w-5 h-5 rounded-full border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />

                                            {/* Compact Image Box */}
                                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 ml-1">
                                                <div className="absolute inset-0 bg-emerald-50 rounded-[20px] rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                                                <img
                                                    src={`${BASE_URL}${item.image}`}
                                                    alt={item.product_name}
                                                    className="relative w-full h-full object-cover rounded-[20px] shadow-sm border border-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Compact Content Box */}
                                        <div className="flex-1 flex flex-col md:flex-row justify-between w-full gap-4">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                                                    {item.product_name}
                                                </h3>
                                                <p className="text-slate-400 text-xs font-normal line-clamp-2 max-w-md">
                                                    High quality premium product with verified authenticity and manufacturer warranty.
                                                </p>
                                                <div className="flex items-center gap-3 pt-2">
                                                    {/* Compact Quantity Controls */}
                                                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                                        <button 
                                                            onClick={() => handleQuantityChange(item, item.qty - 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-emerald-600"
                                                        >
                                                            <FiMinus size={12} />
                                                        </button>
                                                        <span className="px-4 text-sm font-bold text-slate-800">{item.qty}</span>
                                                        <button 
                                                            onClick={() => handleQuantityChange(item, item.qty + 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-emerald-600"
                                                        >
                                                            <FiPlus size={12} />
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.cart_id)}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price Tag */}
                                            <div className="flex flex-col items-start md:items-end justify-center min-w-[140px] sm:pt-0 pt-2 border-t sm:border-t-0 border-slate-100">
                                                {item.discount_status === 1 && (
                                                    <span className="text-xs text-slate-300 line-through font-bold">LKR {item.price}</span>
                                                )}
                                                <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
                                                    <span className="text-xs text-emerald-600 mr-0.5">LKR</span> 
                                                    {parseFloat(item.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50/60 px-2.5 py-0.5 rounded-full mt-1">FREE DELIVERY</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Order Summary */}
                        <div className="w-full xl:w-[380px]">
                            <div className="sticky top-10 space-y-4">
                                <div className="bg-slate-900 text-white p-8 rounded-[35px] shadow-xl relative overflow-hidden">
                                    {/* Design Elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                                    <h2 className="text-xl font-bold mb-6 relative z-10">Summary</h2>
                                    
                                    <div className="space-y-4 relative z-10 text-xs sm:text-sm">
                                        <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-[2px]">
                                            <span>Subtotal</span>
                                            <span className="text-white">LKR {calculateSelectedSubtotal()}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-[2px]">
                                            <span>Shipping Fee</span>
                                            <span className="text-emerald-400">FREE</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-[2px]">
                                            <span>Discount</span>
                                            <span className="text-white">LKR 0.00</span>
                                        </div>
                                        
                                        <div className="h-[1px] bg-slate-800 my-2"></div>
                                        
                                        <div className="flex justify-between items-end">
                                            <span className="text-slate-400 font-bold">Total Payable</span>
                                            <div className="text-right">
                                                <span className="block text-2xl font-extrabold text-white tracking-tight">
                                                    LKR {calculateSelectedSubtotal()}
                                                </span>
                                                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Taxes Included</span>
                                            </div>
                                        </div>

                                        <button
                                            disabled={selectedCount === 0}
                                            className={`w-full py-4 rounded-[20px] font-bold uppercase tracking-[2px] text-xs transition-all duration-500 mt-2 ${
                                                selectedCount > 0 
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-95' 
                                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                            }`}
                                            onClick={() => navigate('/checkout')}
                                        >
                                            Complete Checkout
                                        </button>
                                    </div>
                                </div>

                                {/* Security Badges */}
                                <div className="bg-white/50 border border-white/50 backdrop-blur-md rounded-[24px] p-6 flex justify-around items-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <FiShield className="text-emerald-600 text-lg" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Safe Pay</span>
                                    </div>
                                    <div className="h-6 w-[1px] bg-slate-200"></div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <FiTruck className="text-emerald-600 text-lg" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Fast Ship</span>
                                    </div>
                                    <div className="h-6 w-[1px] bg-slate-200"></div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <MdVerified className="text-emerald-600 text-lg" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(40px, -60px) scale(1.15); }
                    66% { transform: translate(-20px, 20px) scale(0.85); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 12s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animate-spin-slow {
                    animation: spin 6s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default CartPage;