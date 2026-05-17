import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { paymentApi } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../layout/Navbar';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [error, setError] = useState(null);
    
    const session_id = searchParams.get('session_id');
    const order_id = searchParams.get('order_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!session_id || !order_id) {
                setVerifying(false);
                setError('Missing payment information');
                return;
            }

            try {
                // Call backend to verify payment
                const response = await paymentApi.verifyStripePayment(session_id, order_id);
                
                if (response.data.success) {
                    setVerified(true);
                    setOrderDetails({
                        order_id: order_id,
                        session_id: session_id
                    });
                    toast.success('Payment verified successfully!');
                } else {
                    setError(response.data.msg || 'Payment verification failed');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setError(err.response?.data?.msg || 'Failed to verify payment');
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [session_id, order_id]);

    if (verifying) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
                        <p className="text-gray-500">Please wait while we confirm your payment...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/orders" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
                                View Orders
                            </Link>
                            <Link to="/" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    {/* Success Animation */}
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful! 🎉</h1>
                    <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
                    
                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <p className="font-mono text-sm font-semibold text-gray-800 mb-3">{order_id}</p>
                        
                        <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                        <p className="font-mono text-xs text-gray-600 break-all">{session_id}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <Link 
                            to={`/orders/${order_id}`} 
                            className="bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                        >
                            View Order Details
                        </Link>
                        <Link 
                            to="/" 
                            className="border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                    
                    {/* Email Notification */}
                    <p className="text-xs text-gray-400 mt-6">
                        A confirmation email has been sent to your registered email address.
                    </p>
                </div>
            </div>
        </>
    );
};

export default OrderSuccess;