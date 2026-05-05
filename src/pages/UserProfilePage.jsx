
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import { userApi, shippingAddressApi } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoLocationOutline, IoSaveOutline, IoArrowBack } from 'react-icons/io5';
import { ArrowLeft } from 'lucide-react';

const LoadingSpinner = () => (
    <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-emerald-600 rounded-full" role="status">
        <span className="sr-only">Loading...</span>
    </div>
);

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        district: '',
        postal_code: '',
        country: 'Sri Lanka',
        mobile_no_1: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Please login to view profile.');
            navigate('/login');
            return;
        }
        fetchUserProfile();
    }, [navigate]);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const response = await userApi.getUserProfile();
            const userData = response.data;
            setUser(userData);
            
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                address_line1: userData.address_line1 || userData.addree_line1 || '',
                address_line2: userData.address_line2 || '',
                city: userData.city || '',
                district: userData.disctric || userData.district || '',
                postal_code: userData.postal_code || '',
                country: userData.country || 'Sri Lanka',
                mobile_no_1: userData.mobile_no_1 || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const recipientName = `${formData.first_name} ${formData.last_name}`.trim();
            
            const updateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                address_line1: formData.address_line1,
                address_line2: formData.address_line2,
                city: formData.city,
                district: formData.district,
                postal_code: formData.postal_code,
                country: formData.country,
                mobile_no_1: formData.mobile_no_1
            };
            
            await userApi.updateUser(updateData, user.user_id);
            
            const shippingRes = await shippingAddressApi.getShippingAddressesByUserId(user.user_id);
            
            if (shippingRes.data && shippingRes.data.length > 0) {
                const existingAddress = shippingRes.data[0];
                await shippingAddressApi.updateShippingAddress(existingAddress.shipping_id, {
                    recipient_name: recipientName,
                    address_line_1: formData.address_line1,
                    address_line_2: formData.address_line2,
                    city: formData.city,
                    district: formData.district,
                    postal_code: formData.postal_code,
                    country: formData.country,
                    phone_number: formData.mobile_no_1,
                    is_default: true
                });
            } else {
                await shippingAddressApi.createShippingAddress({
                    user_id: user.user_id,
                    recipient_name: recipientName,
                    address_line_1: formData.address_line1,
                    address_line_2: formData.address_line2,
                    city: formData.city,
                    district: formData.district,
                    postal_code: formData.postal_code,
                    country: formData.country,
                    phone_number: formData.mobile_no_1,
                    is_default: true
                });
            }
            
            const updatedUser = { ...user, ...updateData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            toast.success('Address saved successfully!');
            
            setTimeout(() => {
                navigate('/checkout');
            }, 1500);
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error(error.response?.data?.msg || 'Failed to save address');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <LoadingSpinner />
                    <p className="ml-2 text-gray-700">Loading profile...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Navbar />
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate('/checkout')}
                        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <IoArrowBack size={20} /> Back to Checkout
                    </button>
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                        <IoLocationOutline size={30} className="text-emerald-600" /> 
                        My Shipping Address
                    </h1>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <p className="text-gray-600 mb-6">
                            Update your shipping address below. This address will be used for all your orders.
                        </p>
                        
                        <form onSubmit={handleSaveAddress} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                                <input
                                    type="text"
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="House number, street name"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    name="address_line2"
                                    value={formData.address_line2}
                                    onChange={handleInputChange}
                                    placeholder="Apartment, suite, unit, etc."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="mobile_no_1"
                                    value={formData.mobile_no_1}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="+94 XX XXX XXXX"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                                >
                                    {saving ? <LoadingSpinner /> : <IoSaveOutline size={20} />}
                                    {saving ? 'Saving...' : 'Save Address'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/checkout')}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <button
                        onClick={() => navigate('/checkout')}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <ArrowLeft size={20} /> Back to Checkout
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserProfilePage;