import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const OrderCancel = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        toast.info('Payment was cancelled. You can try again.');
        
        setTimeout(() => {
            if (orderId) {
                navigate(`/checkout`);
            } else {
                navigate('/');
            }
        }, 3000);
    }, [orderId, navigate]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-yellow-50">
            <div className="text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
                <p className="text-gray-500">Your payment was cancelled. Redirecting to checkout...</p>
            </div>
        </div>
    );
};

export default OrderCancel;