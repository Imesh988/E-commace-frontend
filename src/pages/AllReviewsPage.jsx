import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { feedbackApi, productApi } from '../services/api';
import { IoStar, IoStarOutline, IoArrowBack } from 'react-icons/io5';
import Navbar from '../layout/Navbar';
import toast from 'react-hot-toast';

const BASE_URL = "http://localhost:5000";

const AllReviewsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [feedbackStats, setFeedbackStats] = useState({ avgRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchProduct = async () => {
        try {
            const response = await productApi.getProductById(productId);
            setProduct(response.data || response.data.data || response.data.product);
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const response = await feedbackApi.getFeedbackByProductId(productId, { 
                sort, 
                page,
                limit: 10 
            });
            setFeedback(response.data.data || []);
            setFeedbackStats({
                avgRating: response.data.avgRating || 0,
                totalReviews: response.data.totalReviews || 0
            });
            setHasMore((response.data.data || []).length === 10);
        } catch (error) {
            console.error('Error fetching feedback:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        fetchFeedback();
    }, [productId, sort, page]);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<IoStar key={i} className="text-yellow-400" size={16} />);
            } else {
                stars.push(<IoStarOutline key={i} className="text-yellow-400" size={16} />);
            }
        }
        return stars;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-yellow-50">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition mb-4"
                    >
                        <IoArrowBack size={20} />
                        Back to Products
                    </button>
                    
                    {product && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6">
                            {product.image && (
                                <img
                                    src={`${BASE_URL}${product.image.startsWith('/') ? product.image : `/${product.image}`}`}
                                    alt={product.product_name}
                                    className="w-24 h-24 object-cover rounded-xl"
                                />
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{product.product_name}</h1>
                                <p className="text-xl font-semibold text-emerald-600 mt-1">LKR {parseFloat(product.price).toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rating Summary */}
                <div className="bg-gradient-to-r from-emerald-500 to-amber-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                {renderStars(Math.round(feedbackStats.avgRating))}
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{feedbackStats.avgRating}</p>
                                <p className="text-sm opacity-90">{feedbackStats.totalReviews} reviews</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Based on customer reviews</p>
                        </div>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Sort by:</label>
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="newest">Newest First</option>
                        <option value="highest">Highest Rating First</option>
                        <option value="lowest">Lowest Rating First</option>
                    </select>
                </div>

                {/* Feedback List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : feedback.length > 0 ? (
                    <div className="space-y-4">
                        {feedback.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-bold text-gray-800">{review.customer_name || 'Anonymous'}</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <p className="text-gray-600 leading-relaxed">{review.feedback}</p>
                                {review.preview_img && (
                                    <img
                                        src={`${BASE_URL}${review.preview_img.startsWith('/') ? review.preview_img : `/${review.preview_img}`}`}
                                        alt="Feedback preview"
                                        className="mt-4 w-40 h-40 object-cover rounded-lg border border-gray-200"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No reviews yet</h3>
                        <p className="text-gray-600">Be the first to review this product!</p>
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && !loading && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg"
                        >
                            Load More Reviews
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllReviewsPage;
