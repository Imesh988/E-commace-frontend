import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import { shippingAddressApi, userApi } from '../services/api';
import { IoLocationOutline, IoAddCircleOutline, IoPencil, IoTrash, IoStar, IoStarOutline } from 'react-icons/io5';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft } from 'lucide-react';

const LoadingSpinner = () => (
    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-emerald-600 rounded-full" role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
    </div>
);

const ShippingAddressPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAddress, setCurrentAddress] = useState({
        shipping_id: null,
        recipient_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        district: '',
        postal_code: '',
        country: 'Sri Lanka', // Default country
        phone_number: '',
        is_default: false
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Please login to manage your addresses.');
            navigate('/login');
            return;
        }
        // User data localStorage එකෙන් load කරගන්න
        const storedUser = localStorage.getItem('user');
        
        
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('user');
            }
        }
        fetchAddresses();
    }, [navigate]);

    

 // ShippingAddressPage.jsx එකේ fetchAddresses function එක

// ShippingAddressPage.jsx එකේ fetchAddresses function එක
const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const userProfileRes = await userApi.getUserProfile();
        const fetchedUser = userProfileRes.data;
        setUser(fetchedUser);
        localStorage.setItem('user', JSON.stringify(fetchedUser));

        if (!fetchedUser || !fetchedUser.user_id) {
            throw new Error("User data is not available or incomplete.");
        }

        console.log("📦 Fetching addresses for user:", fetchedUser.user_id);
        
        // Interceptor එක 404 error එක handle කරලා හිස් array එකක් return කරනවා
        const res = await shippingAddressApi.getShippingAddressesByUserId(fetchedUser.user_id);
        
        console.log("📦 Address response:", res);
        
        // res.data දැන් array එකක් (හිස් වුණත්)
        if (res.data && Array.isArray(res.data)) {
            setAddresses(res.data);
            if (res.data.length === 0) {
                console.log("📦 No addresses found");
                toast.info("You don't have any shipping addresses yet. Add one!");
            } else {
                console.log("📦 Found", res.data.length, "addresses");
            }
        } else {
            setAddresses([]);
            toast.info("You don't have any shipping addresses yet. Add one!");
        }
        
    } catch (err) {
        console.error('❌ Error fetching shipping addresses:', err);
        setError('Failed to load shipping addresses. Please try again.');
        toast.error('Failed to load addresses');
    } finally {
        setLoading(false);
    }
};
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentAddress(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddOrUpdateAddress = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const addressToSubmit = { ...currentAddress };
            addressToSubmit.user_id = user.user_id; // Ensure user_id is always set from state

            let res;
            if (isEditing) {
                res = await shippingAddressApi.updateShippingAddress(currentAddress.shipping_id, addressToSubmit);
                toast.success('Shipping Address Updated Successfully!');
            } else {
                res = await shippingAddressApi.createShippingAddress(addressToSubmit);
                toast.success('Shipping Address Added Successfully!');
            }
            setShowAddForm(false);
            setIsEditing(false);
            resetForm();
           await fetchAddresses(); // Refresh the list

            window.dispatchEvent(new Event('address-updated'));

            const returnToCheckout = localStorage.getItem('returnToCheckout');
            if (returnToCheckout === 'true'){
                localStorage.removeItem('returnToCheckout');
                setTimeout(() => {
                    navigate('/checkout');
                }, 1000);
            }
        } catch (err) {
            console.error('Error saving address:', err.response?.data || err.message);
            toast.error(err.response?.data?.msg || 'Failed to save address. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditClick = (address) => {
        setCurrentAddress({ ...address });
        setIsEditing(true);
        setShowAddForm(true);
    };

    const handleDeleteClick = async (shippingId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }
        try {
            await shippingAddressApi.deleteShippingAddress(shippingId);
            toast.success('Shipping Address Deleted Successfully!');
            fetchAddresses(); // Refresh the list
        } catch (err) {
            console.error('Error deleting address:', err.response?.data || err.message);
            toast.error(err.response?.data?.msg || 'Failed to delete address.');
        }
    };

    const handleSetDefault = async (shippingId) => {
        if (!user || !user.user_id) {
            toast.error('User information is missing. Cannot set default address.');
            return;
        }
        try {
            await shippingAddressApi.setDefaultShippingAddress(user.user_id, shippingId);
            toast.success('Default address set successfully!');
            fetchAddresses(); // Refresh the list to show new default

            window.dispatchEvent(new Event('address-updated'));
        } catch (err) {
            console.error('Error setting default address:', err.response?.data || err.message);
            toast.error(err.response?.data?.msg || 'Failed to set default address.');
        }
    };

    const resetForm = () => {
        setCurrentAddress({
            shipping_id: null,
            recipient_name: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            district: '',
            postal_code: '',
            country: 'Sri Lanka',
            phone_number: '',
            is_default: false
        });
        setIsEditing(false);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <LoadingSpinner />
                    <p className="ml-2 text-gray-700">Loading your addresses...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="text-red-600 text-center mt-8 p-6 bg-white rounded-xl shadow-sm max-w-lg mx-auto">
                    {error}
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
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                        <IoLocationOutline size={30} className="text-emerald-600" /> Manage Shipping Addresses
                    </h1>

                    <button
                        onClick={() => { setShowAddForm(!showAddForm); resetForm(); }}
                        className="mb-6 bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
                    >
                        <IoAddCircleOutline size={22} />
                        {showAddForm ? 'Hide Form' : 'Add New Address'}
                    </button>

                    {showAddForm && (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {isEditing ? 'Edit Shipping Address' : 'Add New Shipping Address'}
                            </h2>
                            <form onSubmit={handleAddOrUpdateAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                                    <input
                                        type="text"
                                        id="recipient_name"
                                        name="recipient_name"
                                        value={currentAddress.recipient_name}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        id="phone_number"
                                        name="phone_number"
                                        value={currentAddress.phone_number}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                                    <input
                                        type="text"
                                        id="address_line_1"
                                        name="address_line_1"
                                        value={currentAddress.address_line_1}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                                    <input
                                        type="text"
                                        id="address_line_2"
                                        name="address_line_2"
                                        value={currentAddress.address_line_2}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={currentAddress.city}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                    <input
                                        type="text"
                                        id="district"
                                        name="district"
                                        value={currentAddress.district}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        id="postal_code"
                                        name="postal_code"
                                        value={currentAddress.postal_code}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={currentAddress.country}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                    />
                                </div>

                                <div className="col-span-full flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        name="is_default"
                                        checked={currentAddress.is_default}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_default" className="text-sm font-medium text-gray-700">Set as Default Address</label>
                                </div>

                                <div className="col-span-full flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowAddForm(false); resetForm(); }}
                                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {formLoading && <LoadingSpinner />}
                                        {isEditing ? 'Update Address' : 'Add Address'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-6">
                        {addresses.length === 0 ? (
                            <div className="text-gray-600 text-center mt-8 p-6 bg-white rounded-xl shadow-sm">
                                <IoLocationOutline size={50} className="text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-semibold mb-4">No shipping addresses found.</p>
                                <p className="text-gray-500">Click "Add New Address" to get started.</p>
                            </div>
                        ) : (
                            addresses.map(address => (
                                <div key={address.shipping_id} className={`bg-white rounded-xl shadow-sm p-6 border transition-all duration-300 ${address.is_default ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            {address.is_default && <IoStar size={20} className="text-amber-500" title="Default Address" />}
                                            {address.recipient_name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {!address.is_default && (
                                                <button
                                                    onClick={() => handleSetDefault(address.shipping_id)}
                                                    className="p-2 rounded-full text-gray-500 hover:text-amber-600 hover:bg-gray-100 transition-colors"
                                                    title="Set as Default"
                                                >
                                                    <IoStarOutline size={20} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditClick(address)}
                                                className="p-2 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                                title="Edit Address"
                                            >
                                                <IoPencil size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(address.shipping_id)}
                                                className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                title="Delete Address"
                                            >
                                                <IoTrash size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-gray-700 leading-relaxed">
                                        <p>{address.address_line_1}</p>
                                        {address.address_line_2 && <p>{address.address_line_2}</p>}
                                        <p>{address.city}, {address.district}</p>
                                        <p>{address.postal_code}, {address.country}</p>
                                        <p className="mt-2 font-medium">Phone: {address.phone_number}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <button
                        onClick={() => navigate('/checkout')}
                        className="mt-10 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <ArrowLeft size={20} /> Back to Checkout
                    </button>
                </div>
            </div>
        </>
    );
};

export default ShippingAddressPage;