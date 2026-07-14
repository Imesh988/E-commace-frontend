import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sellerApi } from '../services/api';
import toast from "react-hot-toast";
import {
    IoBusinessOutline,
    IoRocketOutline,
    IoArrowBackOutline,
    IoTimeOutline,
    IoAlertCircleOutline,
} from 'react-icons/io5';
import clsx from 'clsx';
import Navbar from '../layout/Navbar';
import TextField from "../components/TextField";
import Button from "../components/Button";

const SellerSave = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [existingSeller, setExistingSeller] = useState(null);
    const [userData, setUserData] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        seller_id: '',
        business_name: '',
        owner_name: '',
        email: '',
        mobile_no: '',
        business_address: '',
    });

    // 1. Get user data from navigation state or localStorage
    useEffect(() => {
        const state = location.state;
        let user = null;

        if (state?.userData) {
            user = state.userData;
        } else {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    user = JSON.parse(storedUser);
                } catch (e) {}
            }
        }

        if (user) {
            setUserData(user);
            setFormData((prev) => ({
                ...prev,
                email: user.email || '',
                mobile_no: user.mobile_no || '',
                owner_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            }));
            setLoading(false);
        } else {
            toast.error('Please login first');
            navigate('/login');
        }
    }, [location, navigate]);

    // 2. Check existing seller status
    useEffect(() => {
        const fetchExistingSeller = async () => {
            if (!userData?.user_id) return;
            try {
                const response = await sellerApi.getSellerByUserId(userData.user_id);
                const seller = response.data?.data;
                if (seller) {
                    setExistingSeller(seller);
                    // If rejected (status 3), pre‑fill for re‑application
                    if (seller.status === 3) {
                        setFormData({
                            seller_id: seller.seller_id || '',
                            business_name: seller.business_name || '',
                            owner_name: seller.owner_name || '',
                            email: seller.email || userData.email || '',
                            mobile_no: seller.mobile_no || userData.mobile_no || '',
                            business_address: seller.business_address || '',
                        });
                    } else if (seller.status === 1) {
                        toast.success('You are already an approved seller.');
                        navigate('/sellerDashboard');
                    } else if (seller.status === 2 || seller.status === 4) {
                        navigate('/pending');
                    }
                } else {
                    // No existing seller found
                    setExistingSeller(null);
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    setExistingSeller(null);
                } else {
                    console.error('Error fetching seller:', error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchExistingSeller();
    }, [userData, navigate]);

    // 3. AUTO-FILL SELLER_ID with USER_ID for NEW applications ONLY
    useEffect(() => {
        // Only run if userData exists, existingSeller is null (no seller at all),
        // and the current seller_id is empty.
        if (userData?.user_id && existingSeller === null && !formData.seller_id) {
            setFormData((prev) => ({
                ...prev,
                seller_id: userData.user_id.toString(), // Set user_id as seller_id
            }));
        }
    }, [userData, existingSeller, formData.seller_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.seller_id) newErrors.seller_id = "Seller ID is required";
        if (!formData.business_name) newErrors.business_name = "Business Name is required";
        if (!formData.owner_name) newErrors.owner_name = "Owner Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.mobile_no) newErrors.mobile_no = "Mobile number is required";
        if (!formData.business_address) newErrors.business_address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                user_id: userData?.user_id || null,
            };

            const response = await sellerApi.createSeller(payload);
            
            if (existingSeller?.status === 3) {
                toast.success('Your re‑application has been submitted for review.');
            } else {
                toast.success(response.data?.msg || 'Registration submitted successfully!');
            }
            
            navigate('/pending');
        } catch (error) {
            const msg = error.response?.data?.msg || 'Registration failed!';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const isReapply = existingSeller?.status === 3;
    const statusInfo = existingSeller
        ? existingSeller.status === 2
            ? { label: 'Pending Approval', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: IoTimeOutline }
            : existingSeller.status === 3
                ? { label: 'Rejected – Please Re‑apply', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: IoAlertCircleOutline }
                : existingSeller.status === 4
                    ? { label: 'Re‑application Pending', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: IoTimeOutline }
                    : null
        : null;

    if (loading) {
        return (
            <div className={clsx('min-h-screen', 'bg-gradient-to-br', 'from-slate-50', 'via-emerald-50/20', 'to-amber-50/30', 'flex', 'items-center', 'justify-center')}>
                <div className={clsx('animate-spin', 'rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-emerald-600')}></div>
            </div>
        );
    }

    return (
        <div className={clsx('min-h-screen', 'bg-gradient-to-br', 'from-slate-50', 'via-emerald-50/20', 'to-amber-50/30', 'font-sans', 'antialiased', 'relative', 'overflow-hidden')}>
            {/* Background Decorations */}
            <div className={clsx('fixed', 'inset-0', 'pointer-events-none', 'z-0')}>
                <div className={clsx('absolute', '-top-40', '-right-40', 'w-96', 'h-96', 'bg-emerald-200/40', 'rounded-full', 'blur-3xl')}></div>
                <div className={clsx('absolute', '-bottom-40', '-left-40', 'w-96', 'h-96', 'bg-amber-200/30', 'rounded-full', 'blur-3xl')}></div>
            </div>

            <Navbar />

            <main className={clsx('relative', 'z-10', 'max-w-5xl', 'mx-auto', 'px-4', 'pt-10', 'pb-16')}>
                
                {/* Status Banner */}
                {statusInfo && (
                    <div className={clsx(
                        'flex items-center gap-3 px-8 py-4 rounded-3xl mb-8 border shadow-sm transition-all',
                        statusInfo.color
                    )}>
                        <statusInfo.icon size={24} />
                        <span className={clsx('font-bold', 'text-sm', 'uppercase', 'tracking-wider')}>{statusInfo.label}</span>
                    </div>
                )}

                {/* Main Card */}
                <div className={clsx('relative', 'w-full', 'bg-white', 'backdrop-blur-2xl', 'shadow-2xl', 'rounded-[40px]', 'p-8', 'md:p-12', 'border', 'border-white', 'mx-auto')}>
                    
                    {/* Header Section */}
                    <div className={clsx('flex', 'flex-col', 'md:flex-row', 'md:items-center', 'justify-between', 'gap-6', 'mb-12')}>
                        <div className={clsx('flex', 'items-center', 'gap-4')}>
                            <div className={clsx('w-12', 'h-12', 'bg-emerald-500', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'shadow-lg', 'shadow-emerald-200')}>
                                <IoBusinessOutline className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className={clsx('text-2xl', 'font-bold', 'text-emerald-600')}>
                                    {isReapply ? "Update Seller Details" : "Seller Registration"}
                                </h2>
                                <p className={clsx('text-slate-500', 'text-sm', 'italic')}>
                                    {isReapply ? "Submit your updated information for review" : "Join our marketplace as a verified seller"}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => navigate(-1)}
                            className={clsx('flex', 'items-center', 'gap-2', 'px-4', 'py-2', 'text-slate-500', 'hover:text-emerald-600', 'transition-colors', 'font-medium')}
                        >
                            <IoArrowBackOutline /> Back
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-x-10', 'gap-y-8', 'mb-12')}>
                            
                            {/* 🔥 SELLER ID - Auto-filled & Read-only (Custom Input) */}
                            <div className="space-y-2">
                                <label className={clsx('text-[10px]', 'font-black', 'text-slate-400', 'uppercase', 'tracking-widest', 'flex', 'items-center', 'gap-1.5')}>
                                    Seller ID (Auto-generated)
                                </label>
                                <input
                                    type="text"
                                    name="seller_id"
                                    value={formData.seller_id}
                                    onChange={handleChange}
                                    readOnly
                                    className={clsx(
                                        "w-full bg-slate-100/50 border border-slate-200/50 rounded-2xl px-5 py-4 outline-none font-semibold text-slate-800 cursor-not-allowed opacity-80",
                                        errors.seller_id && "border-rose-400 ring-2 ring-rose-400/30"
                                    )}
                                />
                                {errors.seller_id && (
                                    <p className={clsx('text-rose-500', 'text-xs', 'font-medium', 'mt-1')}>{errors.seller_id}</p>
                                )}
                            </div>

                            <TextField
                                label="Business Name"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                                placeholder="Ex: Green Store PVT"
                                error={errors.business_name}
                            />

                            <TextField
                                label="Owner Full Name"
                                name="owner_name"
                                value={formData.owner_name}
                                onChange={handleChange}
                                placeholder="Ex: John Doe"
                                error={errors.owner_name}
                            />

                            <TextField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@mail.com"
                                error={errors.email}
                                disabled={!!userData?.email}
                            />

                            <TextField
                                label="Mobile Number"
                                name="mobile_no"
                                value={formData.mobile_no}
                                onChange={handleChange}
                                placeholder="Ex: 0771234567"
                                error={errors.mobile_no}
                            />

                            <TextField
                                label="Business Address"
                                name="business_address"
                                value={formData.business_address}
                                onChange={handleChange}
                                placeholder="Street, City, District"
                                error={errors.business_address}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className={clsx('flex', 'justify-end', 'gap-4', 'pt-4', 'border-t', 'border-slate-100')}>
                            <Button
                                title="Cancel"
                                variant="outline"
                                icon="✕"
                                onClick={() => navigate('/')}
                                type="button"
                            />
                            <Button
                                title={submitting ? "Processing..." : (isReapply ? "Update & Re‑apply" : "Register Now")}
                                variant={isReapply ? "warning" : "primary"}
                                icon={<IoRocketOutline />}
                                type="submit"
                                disabled={submitting}
                            />
                        </div>
                    </form>

                    <p className={clsx('mt-8', 'text-center', 'text-[11px]', 'text-slate-400', 'uppercase', 'tracking-widest', 'font-medium')}>
                        By submitting, you agree to our platform's Merchant Policies
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SellerSave;