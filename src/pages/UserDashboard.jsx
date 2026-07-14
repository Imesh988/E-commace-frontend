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
import { BiSearch, BiX } from 'react-icons/bi'; // added for search

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

    // ---------- SEARCH STATE ----------
    const location = useLocation();
    const navigate = useNavigate();
    const currentSearchTerm = new URLSearchParams(location.search).get('search') || '';
    const currentCategory = new URLSearchParams(location.search).get('category') || '';

    const [searchInput, setSearchInput] = useState(currentSearchTerm);
    const debounceTimer = useRef(null);

    // Sync search input when URL changes (e.g., from navbar search)
    useEffect(() => {
        setSearchInput(currentSearchTerm);
    }, [currentSearchTerm]);

    // ---------- CLICK OUTSIDE CART ----------
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setShowCart(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ---------- GUEST CART PERSISTENCE ----------
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.setItem('guestCart', JSON.stringify(cartItems));
        } else {
            localStorage.removeItem('guestCart');
        }
    }, [cartItems]);

    // ---------- FETCH PRODUCTS ----------
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

    // ---------- FETCH CART ----------
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

    // ---------- TRIGGER FETCH ON URL CHANGE ----------
    useEffect(() => {
        fetchProductImages(currentSearchTerm, currentCategory);
        fetchCartItems();
    }, [fetchProductImages, currentSearchTerm, currentCategory]);

    // ---------- LISTEN FOR CART UPDATES ----------
    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCartItems();
        };
        window.addEventListener('cart-updated', handleCartUpdate);
        return () => {
            window.removeEventListener('cart-updated', handleCartUpdate);
        };
    }, []);

    // ---------- SEARCH HANDLER (debounced) ----------
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            const queryParams = new URLSearchParams(location.search);
            if (value.trim()) {
                queryParams.set('search', value.trim());
            } else {
                queryParams.delete('search');
            }
            navigate(`${location.pathname}?${queryParams.toString()}`);
        }, 400);
    };

    const clearSearch = () => {
        setSearchInput('');
        const queryParams = new URLSearchParams(location.search);
        queryParams.delete('search');
        navigate(`${location.pathname}?${queryParams.toString()}`);
    };

    // ---------- CART HANDLERS (unchanged) ----------
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
                const response = await CartApi.addToCart(productId, quantity, totalAmount);
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
                {/* ---------- CREATIVE BACKGROUND PARTICLES ---------- */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-emerald-200/20 animate-float"
                            style={{
                                width: Math.random() * 8 + 4 + 'px',
                                height: Math.random() * 8 + 4 + 'px',
                                left: Math.random() * 100 + '%',
                                top: Math.random() * 100 + '%',
                                animationDelay: Math.random() * 10 + 's',
                                animationDuration: Math.random() * 15 + 10 + 's',
                            }}
                        />
                    ))}
                </div>

                {/* Original animated blobs (green + orange) */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 z-0"></div>
                <div className="absolute bottom-1/4 right-1/2 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>

                <Navbar />

                <div className="relative z-10 max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* ---------- SEARCH BAR (ADDED) ---------- */}
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md">
    <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
    <input
        type="text"
        value={searchInput}
        onChange={handleSearchChange}
        placeholder="Search products..."
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 hover:border-emerald-400 focus:border-emerald-500 outline-none transition shadow-sm text-sm"
    />
    {searchInput && (
        <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
            <BiX size={20} />
        </button>
    )}
</div>
                        {currentCategory && currentCategory !== "All Categories" && (
                            <span className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                                Category: {currentCategory}
                            </span>
                        )}
                    </div>

                    {loadingProductImages ? (
                        // ---------- SKELETON LOADING ----------
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden h-80 animate-pulse">
                                    <div className="w-full h-48 bg-gray-200"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : productImages.length > 0 ? (
                        // ---------- CREATIVE PRODUCT CARDS (unchanged) ----------
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {productImages.map((productImage, index) => {
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
                                        className="group animate-fade-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Card with rotating gradient border on hover */}
                                        <div className="relative bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-transparent transform hover:-translate-y-2 hover:scale-[1.02]">
                                            {/* Rotating gradient border wrapper */}
                                            <div className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-rotate-border"></div>

                                            <div className="relative bg-white rounded-xl overflow-hidden">
                                                {/* Image Container */}
                                                <div className="relative w-full h-52 overflow-hidden bg-gray-100">
                                                    {productImage.image ? (
                                                        <img
                                                            src={`${BASE_URL}${productImage.image.startsWith('/') ? productImage.image : `/${productImage.image}`}`}
                                                            alt={productImage.product_name || "Product Image"}
                                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                                            onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="https://via.placeholder.com/300x200?text=No+Image"
                                                            alt="No Product Image"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}

                                                    {/* ---------- CREATIVE RIBBON DISCOUNT ---------- */}
                                                    {hasDiscount && (
                                                        <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-10">
                                                            <div className="absolute -top-1 -left-1 w-32 rotate-[-45deg] bg-gradient-to-r from-red-500 to-orange-400 text-white text-xs font-bold py-1 text-center shadow-lg transform translate-x-[-25%] translate-y-[25%]">
                                                                {discountAmountText}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Wishlist Icon */}
                                                    <button
                                                        className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-rose-50 hover:text-rose-500 z-20"
                                                        onClick={() => toast.info('Wishlist feature coming soon!')}
                                                    >
                                                        <CiHeart size={20} />
                                                    </button>

                                                    {/* Quick View - Slides up from bottom */}
                                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 z-10">
                                                        <button
                                                            className="px-4 py-1.5 bg-white/90 text-xs font-semibold text-gray-700 rounded-full shadow-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all transform hover:scale-105"
                                                            onClick={() => navigate(`/product/${productImage.product_id}`)}
                                                        >
                                                            Quick View
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="p-4">
                                                    {productImage.category_name && (
                                                        <span className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
                                                            {productImage.category_name}
                                                        </span>
                                                    )}

                                                    <h3 className="text-sm font-semibold text-gray-800 mt-1 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                                        {productImage.product_name || "Untitled Product"}
                                                    </h3>

                                                    <div className="flex items-baseline gap-2 mt-1">
                                                        <span className="text-lg font-bold text-emerald-600">
                                                            LKR {displayPrice.toFixed(2)}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-sm text-gray-400 line-through">
                                                                LKR {originalPrice.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center text-yellow-400 text-sm mt-1">
                                                        <span>★★★★★</span>
                                                        <span className="text-gray-400 ml-1">(4.5)</span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleAddToCart(productImage)}
                                                        disabled={addingToCart[productImage.image_id]}
                                                        className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                                                            addingToCart[productImage.image_id]
                                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-lg'
                                                        }`}
                                                    >
                                                        {addingToCart[productImage.image_id] ? (
                                                            <>
                                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Adding...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CiShoppingCart size={18} />
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // ---------- CREATIVE EMPTY STATE ----------
                        <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-gray-200/60 text-center max-w-2xl mx-auto">
                            <div className="text-7xl mb-6 animate-bounce">🛍️</div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your search or category filters</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow-md"
                            >
                                Browse All Products
                            </button>
                            {(currentSearchTerm || currentCategory) && (
                                <div className="mt-4 text-sm text-gray-400">
                                    {currentSearchTerm && <span>Search: "{currentSearchTerm}"</span>}
                                    {currentCategory && currentCategory !== "All Categories" && (
                                        <span className="ml-2">Category: {currentCategory}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ---------- CART POPUP (unchanged) ---------- */}
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

                {/* ---------- CREATIVE FLOATING CART BUTTON ---------- */}
                {!showCart && cartItems.length > 0 && (
                    <button
                        onClick={() => setShowCart(true)}
                        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition z-40 flex items-center gap-2 group animate-pulse-slow"
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

            {/* ---------- CUSTOM ANIMATIONS ---------- */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
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

                @keyframes fade-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-up {
                    animation: fade-up 0.6s ease-out both;
                }

                @keyframes rotate-border {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-rotate-border {
                    background-size: 200% 200%;
                    animation: rotate-border 2s linear infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                .animate-float {
                    animation: float 20s ease-in-out infinite;
                }

                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default UserDashboard;