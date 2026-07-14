import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerBusinessDetailApi } from '../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import {
    IoBusinessOutline,
    IoArrowBackOutline,
    IoRocketOutline,
    IoStorefrontOutline,
    IoReceiptOutline,
    IoIdCardOutline,
    IoImageOutline,
    IoBanOutline,
    IoCardOutline,
    IoCashOutline,
    IoLockClosedOutline,
} from 'react-icons/io5';

import Navbar from '../layout/Navbar';
import TextField from '../components/TextField';
import Button from '../components/Button';

const SellerBusinessDetailCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        seller_id: '',
        business_reg_no: '',
        tax_id: '',
        store_description: '',
        store_logo: '',
        store_banner: '',
        bank_account_holder: '',
        bank_name: '',
        bank_account_number: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.seller_id) newErrors.seller_id = 'Seller ID is required';
        // Optional: add more validations if needed
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await sellerBusinessDetailApi.create(formData);
            if (response.data.success) {
                toast.success('Business details created successfully!');
                // Optionally navigate to a listing page or dashboard
                navigate('/seller-dashboard'); // adjust route as needed
            } else {
                toast.error(response.data.message || 'Creation failed');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={clsx(
                'min-h-screen',
                'bg-gradient-to-br',
                'from-slate-50',
                'via-emerald-50/20',
                'to-amber-50/30',
                'font-sans',
                'antialiased',
                'relative',
                'overflow-hidden'
            )}
        >
            {/* Background Decorations (same as SellerSave) */}
            <div className={clsx('fixed', 'inset-0', 'pointer-events-none', 'z-0')}>
                <div
                    className={clsx(
                        'absolute',
                        '-top-40',
                        '-right-40',
                        'w-96',
                        'h-96',
                        'bg-emerald-200/40',
                        'rounded-full',
                        'blur-3xl'
                    )}
                ></div>
                <div
                    className={clsx(
                        'absolute',
                        '-bottom-40',
                        '-left-40',
                        'w-96',
                        'h-96',
                        'bg-amber-200/30',
                        'rounded-full',
                        'blur-3xl'
                    )}
                ></div>
            </div>

            <Navbar />

            <main className={clsx('relative', 'z-10', 'max-w-5xl', 'mx-auto', 'px-4', 'pt-10', 'pb-16')}>
                {/* Main Card */}
                <div
                    className={clsx(
                        'relative',
                        'w-full',
                        'bg-white',
                        'backdrop-blur-2xl',
                        'shadow-2xl',
                        'rounded-[40px]',
                        'p-8',
                        'md:p-12',
                        'border',
                        'border-white',
                        'mx-auto'
                    )}
                >
                    {/* Header Section */}
                    <div
                        className={clsx(
                            'flex',
                            'flex-col',
                            'md:flex-row',
                            'md:items-center',
                            'justify-between',
                            'gap-6',
                            'mb-12'
                        )}
                    >
                        <div className={clsx('flex', 'items-center', 'gap-4')}>
                            <div
                                className={clsx(
                                    'w-12',
                                    'h-12',
                                    'bg-emerald-500',
                                    'rounded-2xl',
                                    'flex',
                                    'items-center',
                                    'justify-center',
                                    'shadow-lg',
                                    'shadow-emerald-200'
                                )}
                            >
                                <IoStorefrontOutline className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className={clsx('text-2xl', 'font-bold', 'text-emerald-600')}>
                                    Business Details
                                </h2>
                                <p className={clsx('text-slate-500', 'text-sm', 'italic')}>
                                    Add your store and banking information
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className={clsx(
                                'flex',
                                'items-center',
                                'gap-2',
                                'px-4',
                                'py-2',
                                'text-slate-500',
                                'hover:text-emerald-600',
                                'transition-colors',
                                'font-medium'
                            )}
                        >
                            <IoArrowBackOutline /> Back
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div
                            className={clsx(
                                'grid',
                                'grid-cols-1',
                                'md:grid-cols-2',
                                'lg:grid-cols-3',
                                'gap-x-10',
                                'gap-y-8',
                                'mb-12'
                            )}
                        >
                            {/* Seller ID - required, with icon hint */}
                            <div className="space-y-2">
                                <label
                                    className={clsx(
                                        'text-[10px]',
                                        'font-black',
                                        'text-slate-400',
                                        'uppercase',
                                        'tracking-widest',
                                        'flex',
                                        'items-center',
                                        'gap-1.5'
                                    )}
                                >
                                    <IoIdCardOutline size={14} /> Seller ID <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="seller_id"
                                    value={formData.seller_id}
                                    onChange={handleChange}
                                    placeholder="Enter seller ID"
                                    className={clsx(
                                        'w-full',
                                        'bg-slate-50/80',
                                        'border',
                                        'border-slate-200/60',
                                        'rounded-2xl',
                                        'px-5',
                                        'py-4',
                                        'outline-none',
                                        'focus:ring-2',
                                        'focus:ring-emerald-400/50',
                                        'focus:border-emerald-400',
                                        'transition',
                                        errors.seller_id && 'border-rose-400 ring-2 ring-rose-400/30'
                                    )}
                                />
                                {errors.seller_id && (
                                    <p className={clsx('text-rose-500', 'text-xs', 'font-medium', 'mt-1')}>
                                        {errors.seller_id}
                                    </p>
                                )}
                            </div>

                            <TextField
                                label="Business Registration No."
                                name="business_reg_no"
                                value={formData.business_reg_no}
                                onChange={handleChange}
                                placeholder="e.g. PVT-2024-001"
                                icon={<IoReceiptOutline />}
                            />

                            <TextField
                                label="Tax ID / VAT No."
                                name="tax_id"
                                value={formData.tax_id}
                                onChange={handleChange}
                                placeholder="e.g. VAT-123456"
                                icon={<IoBanOutline />}
                            />

                            {/* Store description spans full width on all screens */}
                            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                                <label
                                    className={clsx(
                                        'text-[10px]',
                                        'font-black',
                                        'text-slate-400',
                                        'uppercase',
                                        'tracking-widest',
                                        'flex',
                                        'items-center',
                                        'gap-1.5'
                                    )}
                                >
                                    <IoStorefrontOutline size={14} /> Store Description
                                </label>
                                <textarea
                                    name="store_description"
                                    value={formData.store_description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Tell customers about your store..."
                                    className={clsx(
                                        'w-full',
                                        'bg-slate-50/80',
                                        'border',
                                        'border-slate-200/60',
                                        'rounded-2xl',
                                        'px-5',
                                        'py-4',
                                        'outline-none',
                                        'focus:ring-2',
                                        'focus:ring-emerald-400/50',
                                        'focus:border-emerald-400',
                                        'transition',
                                        'resize-y'
                                    )}
                                />
                            </div>

                            <TextField
                                label="Store Logo (URL)"
                                name="store_logo"
                                value={formData.store_logo}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                                icon={<IoImageOutline />}
                            />

                            <TextField
                                label="Store Banner (URL)"
                                name="store_banner"
                                value={formData.store_banner}
                                onChange={handleChange}
                                placeholder="https://example.com/banner.png"
                                icon={<IoImageOutline />}
                            />

                            {/* Bank details section – we can group with a subtle separator but keep in grid */}
                            <div className="md:col-span-2 lg:col-span-3 mt-2">
                                <h3
                                    className={clsx(
                                        'text-xs',
                                        'font-bold',
                                        'text-slate-400',
                                        'uppercase',
                                        'tracking-wider',
                                        'border-b',
                                        'border-slate-100',
                                        'pb-3',
                                        'mb-6'
                                    )}
                                >
                                    <IoCardOutline className="inline mr-2" size={16} />
                                    Bank Account Details
                                </h3>
                            </div>

                            <TextField
                                label="Account Holder Name"
                                name="bank_account_holder"
                                value={formData.bank_account_holder}
                                onChange={handleChange}
                                placeholder="Full name on bank account"
                                icon={<IoLockClosedOutline />}
                            />

                            <TextField
                                label="Bank Name"
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleChange}
                                placeholder="e.g. Bank of Ceylon"
                                icon={<IoBusinessOutline />}
                            />

                            <TextField
                                label="Account Number"
                                name="bank_account_number"
                                value={formData.bank_account_number}
                                onChange={handleChange}
                                placeholder="e.g. 1234567890"
                                icon={<IoCashOutline />}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div
                            className={clsx(
                                'flex',
                                'justify-end',
                                'gap-4',
                                'pt-4',
                                'border-t',
                                'border-slate-100'
                            )}
                        >
                            <Button
                                title="Cancel"
                                variant="outline"
                                icon="✕"
                                onClick={() => navigate('/')}
                                type="button"
                            />
                            <Button
                                title={loading ? 'Submitting...' : 'Create Business Details'}
                                variant="primary"
                                icon={<IoRocketOutline />}
                                type="submit"
                                disabled={loading}
                            />
                        </div>
                    </form>

                    <p
                        className={clsx(
                            'mt-8',
                            'text-center',
                            'text-[11px]',
                            'text-slate-400',
                            'uppercase',
                            'tracking-widest',
                            'font-medium'
                        )}
                    >
                        All fields marked with <span className="text-rose-500">*</span> are required
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SellerBusinessDetailCreate;