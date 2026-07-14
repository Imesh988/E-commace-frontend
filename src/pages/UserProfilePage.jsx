import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import { userApi, shippingAddressApi, sellerApi } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    IoLocationOutline,
    IoSaveOutline,
    IoCameraOutline,
    IoPersonOutline,
    IoMailOutline,
    IoRocketOutline,
    IoTimeOutline,
    IoAlertCircleOutline,
    IoCheckmarkCircleOutline,
    IoBuildOutline,
    IoCallOutline,
    IoHomeOutline,
    IoPinOutline,
    IoGlobeOutline
} from 'react-icons/io5';
import clsx from 'clsx';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin shadow-lg shadow-emerald-200/30"></div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Loading profile...</p>
    </div>
);

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [checkingSeller, setCheckingSeller] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        district: '',
        postal_code: '',
        country: 'Sri Lanka',
        mobile_no_1: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Please login to view profile.');
            navigate('/login');
            return;
        }
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage) setProfileImage(savedImage);
        fetchUserProfile();
    }, [navigate]);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const response = await userApi.getUserProfile();
            const userData = response.data;
            setUser(userData);
            
            try {
                const sellerRes = await sellerApi.getSellerByUserId(userData.user_id);
                if (sellerRes.data?.data) {
                    setSellerInfo(sellerRes.data.data);
                }
            } catch (sellerErr) {
                if (sellerErr.response?.status !== 404) {
                    console.error('Error fetching seller info:', sellerErr);
                }
                setSellerInfo(null);
            }

            let shippingAddress = {};
            try {
                const shippingRes = await shippingAddressApi.getShippingAddressesByUserId(userData.user_id);
                const addresses = shippingRes.data?.data || shippingRes.data;
                if (addresses && Array.isArray(addresses) && addresses.length > 0) {
                    shippingAddress = addresses[0];
                }
            } catch (err) { }

            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                address_line1: shippingAddress.address_line_1 || shippingAddress.address_line1 || '',
                address_line2: shippingAddress.address_line_2 || shippingAddress.address_line2 || '',
                city: shippingAddress.city || '',
                district: shippingAddress.district || '',
                postal_code: shippingAddress.postal_code || '',
                country: shippingAddress.country || 'Sri Lanka',
                mobile_no_1: shippingAddress.phone_number || shippingAddress.mobile_no_1 || '',
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setProfileImage(base64String);
                localStorage.setItem('profileImage', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const recipientName = `${formData.first_name} ${formData.last_name}`.trim();
            await userApi.updateUser(
                {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                },
                user.user_id
            );

            const shippingRes = await shippingAddressApi.getShippingAddressesByUserId(user.user_id);
            const addresses = shippingRes.data?.data || shippingRes.data;

            if (addresses && Array.isArray(addresses) && addresses.length > 0) {
                const existingAddress = addresses[0];
                await shippingAddressApi.updateShippingAddress(existingAddress.shipping_id, {
                    recipient_name: recipientName,
                    address_line_1: formData.address_line1,
                    address_line_2: formData.address_line2,
                    city: formData.city,
                    district: formData.district,
                    postal_code: formData.postal_code,
                    country: formData.country,
                    phone_number: formData.mobile_no_1,
                    is_default: true,
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
                    is_default: true,
                });
            }

            const updatedUser = { ...user, first_name: formData.first_name, last_name: formData.last_name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success('Profile & Address saved successfully!');
            await fetchUserProfile();
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to save details');
        } finally {
            setSaving(false);
        }
    };

    const handleBecomeSeller = async () => {
        setCheckingSeller(true);
        try {
            const userId = user?.user_id;
            if (!userId) { navigate('/login'); return; }

            let sellerData = null;
            try {
                const response = await sellerApi.getSellerByUserId(userId);
                sellerData = response.data?.data || response.data;
            } catch (err) {
                if (user?.satus !== undefined) {
                    sellerData = { user_id: user.user_id, status: user.satus };
                }
            }

            if (sellerData) {
                const status = sellerData.status;
                if (status === 1) { navigate('/sellerDashboard'); return; }
                else if (status === 2) { navigate('/pending'); return; }
                else if (status === 3) {
                    navigate('/seller', { state: { editingSeller: sellerData, isReapply: true } });
                    return;
                }
            }

            navigate('/seller', {
                state: {
                    userData: {
                        user_id: user.user_id,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        mobile_no: formData.mobile_no_1,
                    }
                }
            });
        } catch (error) {
            toast.error('Something went wrong.');
        } finally {
            setCheckingSeller(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/30 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const fullName = `${formData.first_name} ${formData.last_name}`.trim() || 'User Name';
    const userInitial = fullName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/30 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
            {/* Background Blobs - Enhanced */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl"></div>
                <div className="absolute top-20 left-20 w-64 h-64 bg-purple-100/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-100/20 rounded-full blur-2xl"></div>
            </div>

            <Navbar />
            <ToastContainer position="top-right" autoClose={3000} theme="light" />

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
                {/* Header Section - Premium */}
                <div className="mb-12 text-center sm:text-left">
                    <div className="inline-block p-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl shadow-lg shadow-emerald-200/30 mb-4">
                        <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-xl">
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">Account Management</span>
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                    </h1>
                    
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column - Profile Card (Premium) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="relative group bg-white/70 backdrop-blur-xl rounded-[40px] border border-white/50 p-8 shadow-2xl shadow-emerald-900/5 hover:shadow-emerald-900/10 transition-shadow duration-500 overflow-hidden">
                            {/* Subtle gradient accent */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-200/30 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-100/30 rounded-full blur-2xl"></div>
                            
                            <div className="relative flex flex-col items-center">
                                {/* Profile Image with creative border */}
                                <div className="relative group/image">
                                    <div className="w-36 h-36 rounded-[40px] overflow-hidden shadow-2xl shadow-emerald-200/40 ring-4 ring-white/80 transform group-hover/image:scale-105 transition-all duration-500">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-5xl font-black">
                                                {userInitial}
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl cursor-pointer hover:bg-emerald-600 transition-all shadow-xl hover:scale-110 active:scale-95">
                                        <IoCameraOutline size={22} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>

                                <div className="mt-8 text-center space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{fullName}</h2>
                                    <p className="text-sm font-medium text-emerald-600 flex items-center justify-center gap-2 bg-emerald-50/50 px-4 py-1.5 rounded-full">
                                        <IoMailOutline size={16} />
                                        {formData.email}
                                    </p>
                                </div>

                                {/* Seller Status - Enhanced */}
                                {sellerInfo && (
                                    <div className="mt-6 w-full pt-6 border-t border-slate-200/30">
                                        <div className={clsx(
                                            "flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all",
                                            sellerInfo.status === 1 ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/50 shadow-sm shadow-emerald-100/50" :
                                            sellerInfo.status === 2 ? "bg-amber-50/80 text-amber-700 border-amber-200/50 shadow-sm shadow-amber-100/50" :
                                            sellerInfo.status === 3 ? "bg-rose-50/80 text-rose-700 border-rose-200/50 shadow-sm shadow-rose-100/50" :
                                            "bg-slate-50/80 text-slate-600 border-slate-200/50"
                                        )}>
                                            {sellerInfo.status === 1 ? <IoCheckmarkCircleOutline size={18} /> :
                                             sellerInfo.status === 2 ? <IoTimeOutline size={18} /> :
                                             sellerInfo.status === 3 ? <IoAlertCircleOutline size={18} /> : null}
                                            {sellerInfo.status === 1 ? "Verified Seller" :
                                             sellerInfo.status === 2 ? "Application Pending" :
                                             sellerInfo.status === 3 ? "Application Rejected" : "Account Restricted"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats (optional creative touch) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30 shadow-sm">
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Orders</p>
                                <p className="text-xl font-bold text-slate-800">—</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30 shadow-sm">
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Wishlist</p>
                                <p className="text-xl font-bold text-slate-800">—</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Card (Premium) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/70 backdrop-blur-xl rounded-[45px] border border-white/50 p-8 sm:p-10 shadow-2xl shadow-emerald-900/5 hover:shadow-emerald-900/10 transition-shadow duration-500 relative overflow-hidden">
                            {/* Decorative accent */}
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-100/20 rounded-full blur-3xl"></div>

                            <div className="relative">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl shadow-inner">
                                        <IoLocationOutline className="text-2xl text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Delivery Information</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">Primary shipping address</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveAddress} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <IoPersonOutline size={14} /> First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-slate-50/80 border border-slate-200/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <IoPersonOutline size={14} /> Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-slate-50/80 border border-slate-200/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <IoHomeOutline size={14} /> Address Line 1
                                        </label>
                                        <input
                                            type="text"
                                            name="address_line1"
                                            value={formData.address_line1}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="House number, street name"
                                            className="w-full bg-slate-50/80 border border-slate-200/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address Line 2 <span className="font-normal text-slate-300">(Optional)</span></label>
                                        <input
                                            type="text"
                                            name="address_line2"
                                            value={formData.address_line2}
                                            onChange={handleInputChange}
                                            placeholder="Apartment, suite, unit, etc."
                                            className="w-full bg-slate-50/80 border border-slate-200/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <IoPinOutline size={14} /> City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-slate-50/80 border border-slate-200/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <IoPinOutline size={14} /> District
                                            </label>
                                            <input
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-slate-50/80 border border-slate-200/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <IoGlobeOutline size={14} /> Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                name="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-slate-50/80 border border-slate-200/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <IoCallOutline size={14} /> Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="mobile_no_1"
                                                value={formData.mobile_no_1}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="+94 XX XXX XXXX"
                                                className="w-full bg-slate-50/80 border border-slate-200/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-5 rounded-[25px] font-black uppercase tracking-[0.15em] text-xs hover:from-emerald-600 hover:to-emerald-500 transition-all shadow-xl shadow-slate-200/50 hover:shadow-emerald-200/50 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {saving ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <IoSaveOutline size={20} />
                                            )}
                                            {saving ? 'Saving...' : 'Save Profile'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleBecomeSeller}
                                            disabled={checkingSeller}
                                            className={clsx(
                                                'flex-1 px-8 py-5 rounded-[25px] font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3',
                                                sellerInfo?.status === 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200/50 hover:shadow-emerald-300/60' :
                                                sellerInfo?.status === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-200/50' :
                                                sellerInfo?.status === 3 ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-200/50' :
                                                'bg-white border border-slate-200 text-slate-700 shadow-slate-100/50 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-emerald-100/50'
                                            )}
                                        >
                                            {checkingSeller ? (
                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <IoRocketOutline size={20} />
                                            )}
                                            {sellerInfo?.status === 1 ? '🚀 Dashboard' :
                                             sellerInfo?.status === 2 ? '⏳ Pending Review' :
                                             sellerInfo?.status === 3 ? '🔄 Re-Apply' :
                                             '🛒 Start Selling'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 10s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default UserProfilePage;