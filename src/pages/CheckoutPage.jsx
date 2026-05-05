import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import { shippingAddressApi, CartApi, orderApi, userApi } from '../services/api';
import { IoShieldCheckmark, IoCardOutline, IoLocationOutline } from 'react-icons/io5';
import { MdLocalShipping } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CiShoppingCart } from 'react-icons/ci';
import { ArrowLeft } from 'lucide-react';
import { FaEdit } from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

const LoadingSpinner = () => (
    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-emerald-600 rounded-full" role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
    </div>
);

// ✅ EditAddressModal component එක CheckoutPage එකෙන් පිටතට ගන්න
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Edit Shipping Address</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                        <input type="text" name="recipient_name" value={formData.recipient_name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                        <input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                        <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <input type="text" name="district" value={formData.district} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
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

    // ✅ Address update handler function
    const handleAddressUpdate = () => {
        console.log('Address updated event received, refreshing...');
        fetchCheckoutData();
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Please login to proceed to checkout.');
            navigate('/login');
            return;
        }

        // ✅ Add event listener for address updates
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

        // ✅ Cleanup event listener
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

        try {
            // User Profile Fetching
            const userProfileRes = await userApi.getUserProfile();
            const fetchedUser = userProfileRes.data;
            setUser(fetchedUser);
            localStorage.setItem('user', JSON.stringify(fetchedUser));

            if (!fetchedUser || !fetchedUser.user_id) {
                throw new Error("User data is not available or incomplete after fetching profile.");
            }

            // Shipping Addresses Fetching
            console.log("Fetching shipping addresses for user:", fetchedUser.user_id);

            let addresses = [];
            try {
                const addressRes = await shippingAddressApi.getShippingAddressesByUserId(fetchedUser.user_id);
                console.log("Address response:", addressRes);

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

            // If no addresses, create one from user profile
            if (addresses.length === 0) {
                console.log("Creating default address from profile...");
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

            // Cart Items Fetching
            const cartRes = await CartApi.getCartItems();
            console.log("Cart API Response:", cartRes);

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
                } else {
                    console.warn("Unexpected cart data structure:", cartRes.data);
                    cartData = [];
                }
            }

            console.log("Setting cart items (count):", cartData.length);
            setCartItems(cartData);

        } catch (err) {
            console.error('Error fetching checkout data:', err);
            setError('Failed to load checkout data. Please try again.');
            toast.error('Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fixed handleUpdateAddress function
    const handleUpdateAddress = async (shippingId, formData) => {
        try {
            const response = await shippingAddressApi.updateShippingAddress(shippingId, formData);
            if (response.data.success || response.data.shipping_id) {
                await fetchCheckoutData();
                toast.success('Address updated successfully!');
                // Dispatch event to notify other components
                window.dispatchEvent(new Event('address-updated'));
                return response.data;
            }
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Failed to update address');
            throw error;
        }
    };

    // ✅ localStorage check for address update
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

    // Calculate functions
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

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a shipping address.');
            return;
        }
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            toast.error('Your cart is empty. Cannot place an order.');
            return;
        }
        if (!paymentMethod) {
            toast.error('Please select a payment method.');
            return;
        }
        if (!user || !user.user_id) {
            toast.error('User information is missing. Please re-login.');
            navigate('/login');
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
                payment_method: paymentMethod,
                discount_amount: discountAmount,
            };

            const orderRes = await orderApi.placeOrder(orderDetails);
            if (orderRes.data.order_id) {
                toast.success('Order placed successfully!');
                navigate(`/orders/${orderRes.data.order_id}`);
                await CartApi.clearCart();
                window.dispatchEvent(new Event('cart-updated'));
            }
        } catch (err) {
            console.error('Error placing order:', err.response?.data || err.message);
            toast.error(err.response?.data?.msg || 'Failed to place order.');
        } finally {
            setProcessingOrder(false);
        }
    };

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

    if (isCartEmpty()) {
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
            <Navbar />
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <IoLocationOutline size={22} className="text-emerald-500" /> Shipping Address
                                    </h2>
                                    <div className="flex gap-2">
                                        
                                        {selectedAddress && (
                                            <button
                                                onClick={() => {
                                                    setEditingAddress(selectedAddress);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="text-lg text-emerald-600 hover:underline"
                                            >
                                                <FaEdit />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {selectedAddress ? (
                                    <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                        <p className="font-semibold">{selectedAddress.recipient_name}</p>
                                        <p>{selectedAddress.address_line_1}, {selectedAddress.city}</p>
                                        {selectedAddress.address_line_2 && <p>{selectedAddress.address_line_2}</p>}
                                        <p>{selectedAddress.district}, {selectedAddress.postal_code}, {selectedAddress.country}</p>
                                        <p>Phone: {selectedAddress.phone_number}</p>
                                        {selectedAddress.is_default && (
                                            <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                                Default Address
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No address selected. <button onClick={() => navigate('/shipping-addresses')} className="text-blue-600 hover:underline">Add one</button></p>
                                )}
                            </div>

                            {/* Cart Items Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <CiShoppingCart size={22} className="text-emerald-500" /> Order Items ({cartItems?.length || 0})
                                </h2>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {cartItems && Array.isArray(cartItems) && cartItems.map((item) => (
                                        <div key={item.cart_id || item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-gray-100">
                                                {item.image ? (
                                                    <img
                                                        src={`${BASE_URL}${item.image.startsWith('/') ? item.image : `/${item.image}`}`}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = "https://via.placeholder.com/80?text=No+Image"; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-md font-medium text-gray-800 line-clamp-2">{item.product_name}</h3>
                                                <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-lg font-bold text-emerald-600">LKR {parseFloat(item.final_price || item.price).toFixed(2)}</p>
                                                    {item.discount_status === 1 && (
                                                        <p className="text-sm text-gray-400 line-through">LKR {parseFloat(item.price).toFixed(2)}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800">LKR {parseFloat(item.total_amount).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => navigate('/')} className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <ArrowLeft size={16} /> Continue Shopping
                                </button>
                            </div>

                            {/* Payment Methods Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <IoCardOutline size={22} className="text-emerald-500" /> Payment Methods
                                </h2>
                                <div className="space-y-4">
                                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="form-radio text-emerald-600 h-5 w-5"
                                        />
                                        <span className="ml-3 text-gray-700 font-medium">Credit/Debit Card</span>
                                        <div className="ml-auto flex gap-2">
                                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Mastercard</span>
                                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Visa</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="form-radio text-emerald-600 h-5 w-5"
                                        />
                                        <span className="ml-3 text-gray-700 font-medium">Cash On Delivery</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-28">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

                                <div className="flex items-center mb-4">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                    >
                                        Apply
                                    </button>
                                </div>

                                <div className="space-y-2 text-gray-700 text-lg mb-4">
                                    <div className="flex justify-between">
                                        <span>Item(s) total ({totalQuantity}):</span>
                                        <span>LKR {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Item(s) discount:</span>
                                        <span className="text-red-500">- LKR {discountAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-800">
                                        <span>Subtotal:</span>
                                        <span>LKR {(subtotal - discountAmount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="flex items-center gap-1">
                                            <MdLocalShipping size={20} className="text-emerald-500" /> Shipping:
                                        </span>
                                        <span className="font-bold text-emerald-600">FREE</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
                                        <span>Order total:</span>
                                        <span>LKR {finalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mt-6">
                                    By submitting your order you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                                </p>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={processingOrder || isCartEmpty() || !selectedAddress || !paymentMethod}
                                    className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-emerald-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processingOrder ? (
                                        <>
                                            <LoadingSpinner /> Placing Order...
                                        </>
                                    ) : (
                                        `Submit Order (${totalQuantity})`
                                    )}
                                </button>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                                    <IoShieldCheckmark size={20} className="text-emerald-500" />
                                    Never overpay with our Price Match Guarantee
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <EditAddressModal
                address={editingAddress}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingAddress(null);
                    fetchCheckoutData();
                }}
                onSave={handleUpdateAddress}
                
            />
        </>
    );
};

export default CheckoutPage;