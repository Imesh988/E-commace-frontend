import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { feedbackApi } from '../services/api';
import toast from 'react-hot-toast';
import { IoStar, IoStarOutline, IoSendOutline, IoArrowBackOutline, IoImageOutline } from 'react-icons/io5';
import Navbar from '../layout/Navbar';
import clsx from 'clsx';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const [formData, setFormData] = useState({
        order_id: '',
        feedback: '',
        rating: 5
    });

    useEffect(() => {
        if (location.state) {
            const { order_id } = location.state;
            setFormData(prev => ({
                ...prev,
                order_id: order_id || ''
            }));
        }
    }, [location.state]);

    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.feedback.trim()) {
            toast.error('Please provide your feedback');
            return;
        }

        if (!formData.order_id) {
            toast.error('Please provide an order ID');
            return;
        }

        setSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('order_id', formData.order_id);
            formDataToSend.append('feedback', formData.feedback);
            formDataToSend.append('rating', formData.rating);
            if (selectedImage) {
                formDataToSend.append('preview_img', selectedImage);
            }

            const response = await feedbackApi.createFeedback(formDataToSend);
            toast.success('Feedback submitted successfully!');
            navigate(-1);
        } catch (error) {
            console.error('Feedback submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = () => {
        return (
            <div className={clsx('flex', 'gap-2')}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className={clsx('text-3xl', 'transition-transform', 'hover:scale-110', 'active:scale-95')}
                    >
                        {star <= formData.rating ? (
                            <IoStar className={clsx('text-yellow-400', 'fill-yellow-400')} />
                        ) : (
                            <IoStarOutline className="text-yellow-400" />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className={clsx('min-h-screen', 'bg-gradient-to-br', 'from-slate-50', 'via-emerald-50/20', 'to-amber-50/30', 'font-sans', 'antialiased')}>
            <Navbar />
            
            <main className={clsx('max-w-3xl', 'mx-auto', 'px-4', 'py-12')}>
                <div className={clsx('bg-white/70', 'backdrop-blur-xl', 'rounded-[40px]', 'border', 'border-white/50', 'p-8', 'shadow-2xl')}>
                    {/* Header */}
                    <div className={clsx('flex', 'items-center', 'gap-4', 'mb-8')}>
                        <button
                            onClick={() => navigate(-1)}
                            className={clsx('p-2', 'hover:bg-slate-100', 'rounded-full', 'transition-colors')}
                        >
                            <IoArrowBackOutline size={24} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className={clsx('text-2xl', 'font-bold', 'text-slate-900')}>Submit Feedback</h1>
                            <p className={clsx('text-sm', 'text-slate-500')}>Share your experience with us</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Order ID */}
                        <div className="space-y-2">
                            <label className={clsx('text-sm', 'font-semibold', 'text-slate-700')}>Order ID</label>
                            <input
                                type="text"
                                name="order_id"
                                value={formData.order_id}
                                onChange={handleInputChange}
                                placeholder="Enter Order ID"
                                className={clsx('w-full', 'bg-slate-50', 'border', 'border-slate-200', 'rounded-2xl', 'px-4', 'py-3', 'focus:ring-2', 'focus:ring-emerald-400', 'outline-none', 'transition-all')}
                            />
                        </div>

                        {/* Rating */}
                        <div className="space-y-2">
                            <label className={clsx('text-sm', 'font-semibold', 'text-slate-700')}>Rating</label>
                            <div className={clsx('bg-slate-50', 'border', 'border-slate-200', 'rounded-2xl', 'px-4', 'py-4')}>
                                {renderStars()}
                                <p className={clsx('text-sm', 'text-slate-500', 'mt-2')}>
                                    {formData.rating} out of 5 stars
                                </p>
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="space-y-2">
                            <label className={clsx('text-sm', 'font-semibold', 'text-slate-700')}>Your Feedback</label>
                            <textarea
                                name="feedback"
                                value={formData.feedback}
                                onChange={handleInputChange}
                                placeholder="Tell us about your experience..."
                                rows="5"
                                required
                                className={clsx('w-full', 'bg-slate-50', 'border', 'border-slate-200', 'rounded-2xl', 'px-4', 'py-3', 'focus:ring-2', 'focus:ring-emerald-400', 'outline-none', 'transition-all', 'resize-none')}
                            />
                        </div>

                        {/* Preview Image Upload */}
                        <div className="space-y-2">
                            <label className={clsx('text-sm', 'font-semibold', 'text-slate-700')}>Preview Image (Optional)</label>
                            <div className={clsx('bg-slate-50', 'border', 'border-slate-200', 'rounded-2xl', 'p-4')}>
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <IoArrowBackOutline size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                                        <IoImageOutline size={32} className="text-slate-400 mb-2" />
                                        <span className="text-sm text-slate-500">Click to upload image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className={clsx('w-full', 'bg-gradient-to-r', 'from-emerald-500', 'to-teal-500', 'text-white', 'py-4', 'rounded-2xl', 'font-semibold', 'flex', 'items-center', 'justify-center', 'gap-2', 'hover:from-emerald-600', 'hover:to-teal-600', 'transition-all', 'shadow-lg', 'shadow-emerald-200', 'disabled:opacity-50', 'disabled:cursor-not-allowed')}
                        >
                            {submitting ? (
                                <div className={clsx('w-5', 'h-5', 'border-2', 'border-white/30', 'border-t-white', 'rounded-full', 'animate-spin')} />
                            ) : (
                                <>
                                    <IoSendOutline size={20} />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default FeedbackPage;
