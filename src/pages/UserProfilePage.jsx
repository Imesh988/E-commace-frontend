import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import { userApi, shippingAddressApi, sellerApi } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    IoLocationOutline,
    IoSaveOutline,
} from 'react-icons/io5';
import { MdOutlinePhotoCamera } from 'react-icons/md';
import clsx from 'clsx';

const LoadingSpinner = () => (
    <div className={clsx('animate-spin', 'inline-block', 'w-6', 'h-6', 'border-[3px]', 'border-current', 'border-t-transparent', 'text-emerald-600', 'rounded-full')} role="status">
        <span className="sr-only">Loading...</span>
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

    // ✅ User Profile + Seller Info එක fetch කරන්න
    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            // 1. User Profile එක ගන්න
            const response = await userApi.getUserProfile();
            const userData = response.data;
            setUser(userData);
              console.log('seller info' ,userData);
            // 2. Seller තොරතුරු ගන්න (user_id එකෙන්)
            try {
                const sellerRes = await sellerApi.getSellerByUserId(userData.user_id);
                if (sellerRes.data?.data) {
                    setSellerInfo(sellerRes.data.data);

                  
                    
                }
            } catch (sellerErr) {
                // Seller නැතිනම් 404 error එකක් එයි - ඒක ignore කරන්න
                if (sellerErr.response?.status !== 404) {
                    console.error('Error fetching seller info:', sellerErr);
                }
                setSellerInfo(null);
            }

            // 3. Shipping Address එක ගන්න
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
            toast.success('Address saved successfully!');
            await fetchUserProfile();
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to save address');
        } finally {
            setSaving(false);
        }
    };

    
const handleBecomeSeller = async () => {
    setCheckingSeller(true);
    try {
        const userId = user?.user_id;
        if (!userId) {
            toast.error('Please login first.');
            navigate('/login');
            return;
        }

        let sellerData = null;

        // 1. API එකෙන් seller ගන්න try කරන්න
        try {
            const response = await sellerApi.getSellerByUserId(userId);
            sellerData = response.data?.data || response.data;
        } catch (err) {
            // API error ආවොත් (404/500) user data එකේ satus බලන්න
            if (user?.satus !== undefined) {
                sellerData = {
                    user_id: user.user_id,
                    status: user.satus,  // satus -> status
                };
            }
        }

        if (sellerData) {
            const status = sellerData.status;
            console.log('Current seller status:', status);

            if (status === 1) {
                toast.success('Welcome back! Redirecting to seller dashboard...');
                navigate('/sellerDashboard');
                return;
            } else if (status === 2) {
                toast.info('Your seller application is pending approval. Please wait.');
                navigate('/pending');
                return;
            } else if (status === 3) {
                toast.warning('Your application was rejected. Please re-submit.');
                navigate('/seller', {
                    state: {
                        editingSeller: sellerData,
                        isReapply: true,
                    }
                });
                return;
            }
        }

        // ❌ Seller record එකක් නැත – new application
       navigate('/seller', {
            state: {
                userData: {
                    user_id: user.user_id,              // ✅ user_id එක එකතු කරන්න
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    mobile_no: formData.mobile_no_1,
                }
            }
        });

    } catch (error) {
        console.error('Error checking seller status:', error);
        toast.error('Something went wrong. Please try again.');
    } finally {
        setCheckingSeller(false);
    }
};
    if (loading) {
        return (
            <>
                <Navbar />
                <div className={clsx('flex', 'justify-center', 'items-center', 'min-h-screen', 'bg-gradient-to-br', 'from-gray-50', 'to-gray-200')}>
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className={clsx('mt-3', 'text-gray-600', 'font-medium')}>Loading your profile...</p>
                    </div>
                </div>
            </>
        );
    }

    const fullName = `${formData.first_name} ${formData.last_name}`.trim() || 'User Name';
    const userInitial = fullName.charAt(0).toUpperCase();
    const email = formData.email;

    return (
        <>
            <div className={clsx('relative', 'min-h-screen', 'bg-gradient-to-br', 'from-violet-50', 'via-fuchsia-50', 'to-amber-50', 'font-sans', 'overflow-x-hidden')}>
                {/* Background Circles */}
                <div className={clsx('absolute', 'top-0', 'left-0', 'w-80', 'h-80', 'bg-emerald-200', 'rounded-full', 'mix-blend-multiply', 'filter', 'blur-xl', 'opacity-30', 'animate-blob', 'z-0')}></div>
                <div className={clsx('absolute', 'bottom-0', 'right-0', 'w-72', 'h-72', 'bg-emerald-100', 'rounded-full', 'mix-blend-multiply', 'filter', 'blur-xl', 'opacity-30', 'animate-blob', 'animation-delay-4000', 'z-0')}></div>
                <div className={clsx('absolute', 'bottom-1/4', 'right-1/2', 'w-64', 'h-64', 'bg-yellow-100', 'rounded-full', 'mix-blend-multiply', 'filter', 'blur-xl', 'opacity-30', 'animate-blob', 'z-0')}></div>
                <div className={clsx('absolute', 'top-1/2', 'left-1/4', 'w-96', 'h-96', 'bg-purple-200', 'rounded-full', 'mix-blend-multiply', 'filter', 'blur-xl', 'opacity-30', 'animate-blob', 'animation-delay-2000', 'z-0')}></div>
                <ToastContainer position="top-right" autoClose={3000} />
                <Navbar />
                <div className={clsx('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-6', 'sm:py-8', 'lg:py-10')}>
                    <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6', 'lg:gap-8')}>
                        <div className={clsx('lg:col-span-1', 'space-y-6')}>
                            <div className={clsx('bg-white', 'rounded-2xl', 'shadow-lg', 'overflow-hidden')}>
                                <div className={clsx('bg-gradient-to-r', 'from-emerald-500', 'to-teal-600', 'h-20', 'sm:h-24')}></div>
                                <div className={clsx('relative', 'px-4', 'sm:px-6', 'pb-6')}>
                                    <div className={clsx('relative', '-mt-10', 'sm:-mt-12', 'flex', 'justify-center')}>
                                        <div className={clsx('w-20', 'h-20', 'sm:w-24', 'sm:h-24', 'rounded-full', 'bg-white', 'p-1', 'shadow-xl')}>
                                            {profileImage ? (
                                                <img
                                                    src={profileImage}
                                                    alt="Profile"
                                                    className={clsx('w-full', 'h-full', 'rounded-full', 'object-cover')}
                                                />
                                            ) : (
                                                <div className={clsx('w-full', 'h-full', 'rounded-full', 'bg-gradient-to-r', 'from-emerald-400', 'to-teal-500', 'flex', 'items-center', 'justify-center', 'text-white', 'text-2xl', 'sm:text-3xl', 'font-bold')}>
                                                    {userInitial}
                                                </div>
                                            )}
                                        </div>
                                        <label className={clsx('absolute', 'bottom-0', 'right-1/3', 'bg-white', 'rounded-full', 'p-1', 'shadow-md', 'hover:bg-gray-100', 'transition', 'cursor-pointer')}>
                                            <MdOutlinePhotoCamera size={14} className={clsx('text-gray-600', 'sm:text-base')} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                    <div className={clsx('text-center', 'mt-2')}>
                                        <h2 className={clsx('text-lg', 'sm:text-xl', 'font-bold', 'text-gray-800')}>{fullName}</h2>
                                    </div>
                                    <div className={clsx('text-center', '-mt-0.5')}>
                                        <h2 className={clsx('text-sm', 'sm:text-base', 'text-blue-500', 'break-all')}>{email}</h2>
                                    </div>
                                    {/* ✅ Seller Status Badge */}
                                    {sellerInfo && (
                                        <div className={clsx('mt-3', 'text-center')}>
                                            <span className={clsx(
                                                "px-3 py-1 text-xs font-semibold rounded-full",
                                                sellerInfo.status === 1 ? "bg-emerald-100 text-emerald-700" :
                                                sellerInfo.status === 2 ? "bg-yellow-100 text-yellow-700" :
                                                sellerInfo.status === 3 ? "bg-rose-100 text-rose-700" :
                                                "bg-gray-100 text-gray-600"
                                            )}>
                                                {sellerInfo.status === 1 ? "✅ Seller (Approved)" :
                                                 sellerInfo.status === 2 ? "⏳ Seller (Pending)" :
                                                 sellerInfo.status === 3 ? "❌ Seller (Rejected)" :
                                                 "🚫 Seller (Deleted)"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={clsx('lg:col-span-2', 'space-y-6')}>
                            <div className={clsx('bg-white', 'rounded-2xl', 'shadow-lg', 'p-4', 'sm:p-6')}>
                                <div className={clsx('flex', 'items-center', 'gap-3', 'mb-6')}>
                                    <div className={clsx('p-2', 'bg-emerald-100', 'rounded-xl')}>
                                        <IoLocationOutline size={20} className={clsx('text-emerald-600', 'sm:text-2xl')} />
                                    </div>
                                    <div>
                                        <h3 className={clsx('text-base', 'sm:text-lg', 'font-bold', 'text-gray-800')}>Shipping Address</h3>
                                        <p className={clsx('text-xs', 'sm:text-sm', 'text-gray-500')}>Manage your delivery details</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveAddress} className={clsx('space-y-4', 'sm:space-y-5')}>
                                    <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4', 'sm:gap-5')}>
                                        <div>
                                            <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>First Name</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                required
                                                className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                            />
                                        </div>
                                        <div>
                                            <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>Last Name</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                required
                                                className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>Address Line 1</label>
                                        <input
                                            type="text"
                                            name="address_line1"
                                            value={formData.address_line1}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="House number, street name"
                                            className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                        />
                                    </div>

                                    <div>
                                        <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>Address Line 2 (Optional)</label>
                                        <input
                                            type="text"
                                            name="address_line2"
                                            value={formData.address_line2}
                                            onChange={handleInputChange}
                                            placeholder="Apartment, suite, unit, etc."
                                            className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                        />
                                    </div>

                                    <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4', 'sm:gap-5')}>
                                        <div>
                                            <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                            />
                                        </div>
                                        <div>
                                            <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>District</label>
                                            <input
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                required
                                                className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                            />
                                        </div>
                                    </div>

                                    <div className={clsx('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4', 'sm:gap-5')}>
                                        <div>
                                            <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>Postal Code</label>
                                            <input
                                                type="text"
                                                name="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleInputChange}
                                                required
                                                className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                            />
                                        </div>
                                        <div>
                                            <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                required
                                                className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={clsx('block', 'text-sm', 'font-medium', 'text-gray-700', 'mb-1')}>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="mobile_no_1"
                                            value={formData.mobile_no_1}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="+94 XX XXX XXXX"
                                            className={clsx('w-full', 'px-3', 'py-2', 'sm:px-4', 'sm:py-2.5', 'rounded-xl', 'border', 'border-gray-200', 'focus:border-emerald-500', 'focus:ring-2', 'focus:ring-emerald-200', 'outline-none', 'transition')}
                                        />
                                    </div>

                                    <div className={clsx('flex', 'flex-col', 'sm:flex-row', 'gap-3', 'sm:gap-4', 'pt-4')}>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className={clsx('flex-1', 'bg-gradient-to-r', 'from-emerald-600', 'to-teal-600', 'text-white', 'px-4', 'py-2.5', 'sm:px-6', 'sm:py-3', 'rounded-xl', 'font-semibold', 'flex', 'items-center', 'justify-center', 'gap-2', 'hover:from-emerald-700', 'hover:to-teal-700', 'transition', 'duration-200', 'shadow-md', 'hover:shadow-lg', 'disabled:opacity-70', 'text-sm', 'sm:text-base')}
                                        >
                                            {saving ? <LoadingSpinner /> : <IoSaveOutline size={18} className="sm:text-xl" />}
                                            {saving ? 'Saving...' : 'Save Address'}
                                        </button>

                                        {/* ✅ Become a Seller Button */}
                                        <button
                                            type="button"
                                            onClick={handleBecomeSeller}
                                            disabled={checkingSeller}
                                            className={clsx(
                                                'flex-1',
                                                'bg-gradient-to-r',
                                                sellerInfo?.status === 1 ? 'from-emerald-500 to-emerald-600' :
                                                sellerInfo?.status === 2 ? 'from-yellow-500 to-yellow-600' :
                                                sellerInfo?.status === 3 ? 'from-rose-500 to-rose-600' :
                                                'from-amber-500 to-orange-500',
                                                'text-white',
                                                'px-4', 'py-2.5', 'sm:px-6', 'sm:py-3',
                                                'rounded-xl', 'font-semibold',
                                                'hover:shadow-lg',
                                                'transition', 'duration-200', 'shadow-md',
                                                'disabled:opacity-70',
                                                'text-sm', 'sm:text-base'
                                            )}
                                        >
                                            {checkingSeller ? (
                                                <span className={clsx('flex', 'items-center', 'gap-2')}>
                                                    <span className={clsx('animate-spin', 'rounded-full', 'h-4', 'w-4', 'border-2', 'border-white', 'border-t-transparent')} />
                                                    Checking...
                                                </span>
                                            ) : (
                                                sellerInfo?.status === 1 ? '🚀 Go to Seller Dashboard' :
                                                sellerInfo?.status === 2 ? '⏳ Pending Approval' :
                                                sellerInfo?.status === 3 ? '🔄 Re-Apply as Seller' :
                                                '🛒 Become a Seller'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfilePage;