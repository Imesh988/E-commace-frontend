// src/pages/PaymentSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaReceipt, FaHome, FaShoppingBag, FaEnvelope } from 'react-icons/fa';
import { usePayment } from '../hooks/usePayment';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const { verifyPayment, loading } = usePayment();
    
    const [paymentStatus, setPaymentStatus] = useState('verifying');
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        const verify = async () => {
            if (sessionId && orderId) {
                const result = await verifyPayment(sessionId, orderId);
                
                if (result.success) {
                    setPaymentStatus('success');
                    setPaymentDetails(result.payment);
                    // Clear cart after successful payment
                    localStorage.removeItem('cart');
                } else {
                    setPaymentStatus('failed');
                }
            } else {
                setPaymentStatus('failed');
            }
        };
        
        verify();
    }, [sessionId, orderId]);

    if (loading) {
        return <LoadingSpinner message="Verifying your payment..." />;
    }

    if (paymentStatus === 'failed') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Failed</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't verify your payment. Please check your email for confirmation or contact support.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/checkout" className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                            Try Again
                        </Link>
                        <Link to="/contact" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                            <FaCheckCircle className="w-14 h-14 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                        <p className="text-green-100">Thank you for your purchase</p>
                    </div>
                    
                    {/* Payment Details */}
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <FaReceipt className="w-6 h-6 text-gray-400" />
                            <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Transaction ID</span>
                                <span className="font-mono text-sm text-gray-800 bg-gray-100 px-3 py-1 rounded">
                                    {paymentDetails?.transaction_id?.slice(0, 20)}...
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-100">
                                <span className="text-gray-600">Order ID</span>
                                <span className="font-semibold text-gray-800">#{orderId}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-100">
                                <span className="text-gray-600">Amount Paid</span>
                                <span className="text-2xl font-bold text-primary-600">LKR {paymentDetails?.amount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-100">
                                <span className="text-gray-600">Payment Method</span>
                                <span className="text-gray-800">Credit / Debit Card (Stripe)</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-100">
                                <span className="text-gray-600">Status</span>
                                <span className="inline-flex items-center gap-1 text-green-600">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Completed
                                </span>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                            <Link 
                                to={`/orders/${orderId}`}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
                            >
                                <FaShoppingBag className="w-4 h-4" />
                                View Order Details
                            </Link>
                            <Link 
                                to="/"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                <FaHome className="w-4 h-4" />
                                Continue Shopping
                            </Link>
                        </div>
                        
                        {/* Email Confirmation Note */}
                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-gray-500">
                            <FaEnvelope className="w-4 h-4" />
                            <span>A confirmation email has been sent to your registered email address.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;