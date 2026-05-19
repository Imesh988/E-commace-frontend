import React, { useEffect, useState, useCallback, useRef } from 'react';
import axiosInstance from '../api/axiosConfig';
import Navbar from '../layout/Navbar';
import { CartApi, productImageApi } from "../services/api";
import { CiShoppingCart, CiHeart } from "react-icons/ci";
import { IoFlashOutline } from 'react-icons/io5';
import { MdLocalShipping } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BASE_URL = "http://localhost:5000";

const UserDashboard = () => {
    const [productImages, setProductImages] = useState([]);
    const [loadingProductImages, setLoadingProductImages] = useState(false);
    const [addingToCart, setAddingToCart] = useState({});
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('guestCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [showCart, setShowCart] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const isAddingRef = useRef(false);
    const cartRef = useRef(null);
    const lastToastId = useRef(null); 

    const location = useLocation();
    const navigate = useNavigate();
    const currentSearchTerm = new URLSearchParams(location.search).get('search') || '';
    const currentCategory = new URLSearchParams(location.search).get('category') || '';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setShowCart(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.setItem('guestCart', JSON.stringify(cartItems));
        } else {
            localStorage.removeItem('guestCart');
        }
    }, [cartItems]);

  const fetchProductImages = useCallback(async (searchTermParam, categoryParam) => {
    setLoadingProductImages(true);
    try {
        let response;
        if (searchTermParam) {
            response = await productImageApi.getProductImageByText(searchTermParam);
        } else if (categoryParam && categoryParam !== "All Categories") {
            response = await productImageApi.getProductImageByCategory(categoryParam);
        } else {
            response = await productImageApi.getAllProductImage();
        }

        console.log("🟢 Full response:", response);
        console.log("🟢 response.data:", response.data);
        
        let receivedData = [];
        
        if (Array.isArray(response.data)) {
            receivedData = response.data;
            console.log("✅ Case 1: response.data is array, length:", receivedData.length);
        }
        else if (response.data && Array.isArray(response.data.data)) {
            receivedData = response.data.data;
            console.log("✅ Case 2: response.data.data is array, length:", receivedData.length);
        }
        else if (Array.isArray(response)) {
            receivedData = response;
            console.log("✅ Case 3: response is array, length:", receivedData.length);
        }
        else {
            console.warn("⚠️ Unknown response structure:", response);
            receivedData = [];
        }
        
        console.log("📦 Final receivedData length:", receivedData.length);
        console.log("📦 First product sample:", receivedData[0]);
        
        setProductImages(receivedData);
        
    } catch (error) {
        console.error("Fetch Product Images Error:", error);
        setProductImages([]);
        toast.error('Failed to load products');
    } finally {
        setLoadingProductImages(false);
    }
}, []);

    const fetchCartItems = async () => {
        setCartLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await CartApi.getCartItems();
                setCartItems(response.data.data || []);
            } catch (error) {
                console.error('Error fetching cart for logged-in user:', error);
                setCartItems([]);
            }
        } else {
            const savedCart = localStorage.getItem('guestCart');
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
        }
        setCartLoading(false);
    };

    useEffect(() => {
        fetchProductImages(currentSearchTerm, currentCategory);
        fetchCartItems();
    }, [fetchProductImages, currentSearchTerm, currentCategory]);

    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCartItems();
        };
        window.addEventListener('cart-updated', handleCartUpdate);
        return () => {
            window.removeEventListener('cart-updated', handleCartUpdate);
        };
    }, []);

    const handleAddToCart = async (product) => {
        if (isAddingRef.current) {
            return;
        }
        isAddingRef.current = true; 

        const token = localStorage.getItem('token');
        setAddingToCart(prev => ({ ...prev, [product.image_id]: true }));

        try {
            const productId = product.product_id;
            let finalPrice = parseFloat(product.price);

            if (product.discount_id && product.discount_status === 1) {
                if (product.discount_type === 'percentage') {
                    finalPrice = finalPrice * (1 - parseFloat(product.discount_amount) / 100);
                } else if (product.discount_type === 'fixed') {
                    finalPrice = finalPrice - parseFloat(product.discount_amount);
                }
                if (finalPrice < 0) finalPrice = 0;
            }

            const quantity = 1;
            const totalAmount = finalPrice * quantity;

            if (token) {
                const response = await CartApi.addToCart(productId, quantity , totalAmount);
                if (response.data.success) {
                    toast.success(response.data.message || 'Added to cart!');
                    await fetchCartItems();
                    setShowCart(true);
                    window.dispatchEvent(new Event('cart-updated'));
                }
            } else {
                let updatedCart;
                setCartItems(prevCart => {
                    const existingItemIndex = prevCart.findIndex(item => item.product_id === productId);
                    if (existingItemIndex > -1) {
                        updatedCart = prevCart.map((item, index) =>
                            index === existingItemIndex
                                ? { ...item, qty: item.qty + quantity, total_amount: (item.qty + quantity) * parseFloat(item.final_price) }
                                : item
                        );
                    } else {
                        updatedCart = [...prevCart, {
                            cart_id: `guest_${Date.now()}_${productId}`,
                            product_id: productId,
                            product_name: product.product_name,
                            image: product.image,
                            price: product.price,
                            final_price: finalPrice,
                            discount_status: product.discount_status,
                            discount_amount: product.discount_amount,
                            discount_type: product.discount_type,
                            qty: quantity,
                            total_amount: totalAmount
                        }];
                    }
                    return updatedCart;
                });
                
                if (lastToastId.current) {
                    toast.dismiss(lastToastId.current);
                }
                lastToastId.current = toast.success('Added to cart!');
                setShowCart(true);
            }

        } catch (error) {
            console.log('=== FULL ERROR DETAILS ===');
    console.log('Error object:', error);
    console.log('Error response:', error.response);
    console.log('Error response data:', error.response?.data);
    console.log('Error status:', error.response?.status);
    console.log('Error headers:', error.response?.headers);
    console.log('Request config:', error.config);
    console.log('Request data:', error.config?.data);
    console.log('=========================');
    
    if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
    } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
    } else {
        toast.error(error.message || 'Failed to add to cart');
    }
            
            
            
        } finally {
            setTimeout(() => {
                isAddingRef.current = false;
                setAddingToCart(prev => ({ ...prev, [product.image_id]: false }));
            }, 500);
        }
    };

    const handleUpdateQuantity = async (cartId, newQty, item) => {
        if (newQty < 1) return;

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const newTotal = parseFloat(item.final_price) * newQty;
                await CartApi.updateCartItem(cartId, { qty: newQty, totalAmount: newTotal });
                await fetchCartItems();
            } catch (error) {
                console.error('Error updating cart:', error);
                toast.error('Failed to update cart');
            }
        } else {
            setCartItems(prevCart => {
                return prevCart.map(cartItem =>
                    cartItem.cart_id === cartId
                        ? { ...cartItem, qty: newQty, total_amount: newQty * parseFloat(cartItem.final_price) }
                        : cartItem
                );
            });
        }
    };

    const handleRemoveItem = async (cartId) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await CartApi.removeCartItem(cartId);
                await fetchCartItems();
                toast.success('Item removed');
            } catch (error) {
                console.error('Error removing item:', error);
                toast.error('Failed to remove item');
            }
        } else {
            setCartItems(prevCart => prevCart.filter(item => item.cart_id !== cartId));
            toast.success('Item removed');
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + parseFloat(item.total_amount), 0).toFixed(2);
    };

  const handleCheckoutClick = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        toast.warning("please loging ");
        navigate('/login');
        return;
    }
    
    // if (cartItems.length === 0) {
    //     toast.warning("ඔබේ කාර්ට් එක හිස්ය. කරුණාකර අයිතම් එකතු කරන්න.");
    //     return;
    // }
    
   window.location.href = '/checkout';
};

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-yellow-50 font-sans overflow-hidden">
                <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 z-0"></div>
                <div className="absolute bottom-1/4 right-1/2 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                <Navbar />

                <div className="relative z-10 max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {loadingProductImages ? (
                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse">
                            {[...Array(10)].map((_, index) => (
                                <div key={index} className="bg-gray-200 rounded-lg overflow-hidden shadow-sm h-72"></div>
                            ))}
                        </div>
                    ) : productImages.length > 0 ? (
                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {productImages.map((productImage) => {
                                const originalPrice = parseFloat(productImage.price);
                                let displayPrice = originalPrice;
                                let discountAmountText = "";
                                let hasDiscount = false;

                                if (productImage.discount_id && productImage.discount_status === 1) {
                                    hasDiscount = true;
                                    const discountType = productImage.discount_type;
                                    const discountValue = parseFloat(productImage.discount_amount);

                                    if (discountType === "percentage") {
                                        displayPrice = originalPrice * (1 - discountValue / 100);
                                        discountAmountText = `${discountValue}% OFF`;
                                    } else if (discountType === "fixed") {
                                        displayPrice = originalPrice - discountValue;
                                        discountAmountText = `LKR ${discountValue.toFixed(2)} OFF`;
                                    }
                                    if (displayPrice < 0) displayPrice = 0;
                                }

                                return (
                                    <div
                                        key={productImage.image_id}
                                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative group transform hover:-translate-y-1 border border-gray-100"
                                    >
                                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                            {productImage.image ? (
                                                <img
                                                    src={`${BASE_URL}${productImage.image.startsWith('/') ? productImage.image : `/${productImage.image}`}`}
                                                    alt={productImage.product_name || "Product Image"}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/200x150?text=No+Image"; }}
                                                />
                                            ) : (
                                                <img
                                                    src="https://via.placeholder.com/200x150?text=No+Image"
                                                    alt="No Product Image"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            {hasDiscount && (
                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                                                    {discountAmountText}
                                                </span>
                                            )}

                                            <button
                                                onClick={() => handleAddToCart(productImage)}
                                                disabled={addingToCart[productImage.image_id]}
                                                className={`absolute bottom-2 right-2 p-2 bg-emerald-600 text-white rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 transform shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                title="Add to Cart"
                                            >
                                                {addingToCart[productImage.image_id] ? (
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <CiShoppingCart size={20} className="stroke-2" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-base font-semibold text-gray-800 mb-1 leading-tight truncate" title={productImage.product_name}>
                                                {productImage.product_name || "Untitled Product"}
                                            </h3>
                                            {productImage.category_name && (
                                                <p className="text-xs text-gray-500 mb-2 truncate" title={productImage.category_name}>
                                                    Category: {productImage.category_name}
                                                </p>
                                            )}
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <p className="text-xl font-bold text-emerald-700">
                                                    LKR {displayPrice.toFixed(2)}
                                                </p>
                                                {hasDiscount && (
                                                    <p className="text-sm text-gray-500 line-through">
                                                        LKR {originalPrice.toFixed(2)}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center text-yellow-400 text-sm">
                                                <span>4.5</span>
                                                <span className="ml-1 text-gray-500">(120 reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                            <p className="text-xl text-gray-600">No products found for your search and category filters!</p>
                            {(currentSearchTerm || currentCategory) && (
                                <div className="mt-4 space-y-2">
                                    {currentSearchTerm && (
                                        <p className="text-md text-gray-500">
                                            Search term: <span className="font-semibold text-emerald-600">"{currentSearchTerm}"</span>
                                        </p>
                                    )}
                                    {currentCategory && currentCategory !== "All Categories" && (
                                        <p className="text-md text-gray-500">
                                            Category: <span className="font-semibold text-amber-600">"{currentCategory}"</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {showCart && cartItems.length > 0 && (
                    <div
                        ref={cartRef}
                        className="fixed top-20 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slideIn"
                    >
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <IoFlashOutline size={24} />
                                    <h3 className="font-bold">Lightning Deal</h3>
                                </div>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="text-white/80 hover:text-white text-xl"
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-xs text-white/90 mt-1">{cartItems.length} items</p>
                        </div>

                        <div className="max-h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {cartLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.cart_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex gap-3">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border relative">
                                                {item.image ? (
                                                    <img
                                                        src={`${BASE_URL}${item.image.startsWith('/') ? item.image : `/${item.image}`}`}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/80?text=No+Image";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                        No img
                                                    </div>
                                                )}
                                                {item.discount_status === 1 && (
                                                    <div className="absolute top-1 left-1 bg-orange-500 text-white text-[8px] px-1 rounded">
                                                        -{item.discount_amount}%
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{item.product_name}</h4>

                                                <div className="flex items-baseline gap-1 mb-2">
                                                    <p className="text-lg font-bold text-emerald-600">
                                                        LKR {parseFloat(item.final_price).toFixed(2)}
                                                    </p>
                                                    {item.discount_status === 1 && (
                                                        <p className="text-xs text-gray-400 line-through">
                                                            LKR {parseFloat(item.price).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center border rounded-lg bg-gray-50">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.cart_id, item.qty - 1, item)}
                                                            disabled={item.qty <= 1}
                                                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 disabled:opacity-30 rounded-l-lg"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.cart_id, item.qty + 1, item)}
                                                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-r-lg"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.cart_id)}
                                                        className="text-red-500 text-xs hover:text-red-600 font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t bg-white">
                            <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-sm mb-3 flex items-center gap-2">
                                <IoFlashOutline size={18} />
                                <span className="font-medium">Almost sold out! {cartItems.length} items in cart</span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-bold text-xl text-emerald-600">LKR {calculateSubtotal()}</span>
                            </div>

                            <button
                                className="w-full bg-emerald-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-lg"
                                onClick={handleCheckoutClick}
                            >
                                Checkout ({cartItems.length})
                            </button>

                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full bg-white text-emerald-600 border-2 border-emerald-600 py-3 rounded-lg text-sm font-bold hover:bg-emerald-50 transition mb-3"
                            >
                                Go to Cart →
                            </button>

                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                <span>Free shipping</span>
                                <span>Secure checkout</span>
                                <span>30-day returns</span>
                            </div>
                        </div>
                    </div>
                )}

                {!showCart && cartItems.length > 0 && (
                    <button
                        onClick={() => setShowCart(true)}
                        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition z-40 flex items-center gap-2 group"
                    >
                        <div className="relative">
                            <CiShoppingCart size={28} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white">
                                {cartItems.length}
                            </span>
                        </div>
                        <span className="font-medium group-hover:block hidden">View Cart</span>
                    </button>
                )}
            </div>

            {/* <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style> */}
        </>
    );
};

export default UserDashboard;