import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CartApi } from '../services/api';
import { toast } from 'react-toastify';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    console.log("🎉 OrderSuccess page loaded!");
    console.log("Session ID from URL:", sessionId);
    console.log("Order ID from URL:", orderId);
    console.log("Full URL:", window.location.href);

    useEffect(() => {
        const verifyAndClear = async () => {
            if (!sessionId || !orderId) {
                console.log("Missing parameters, redirecting to home");
                toast.error("Invalid payment response");
                navigate('/');
                return;
            }

            try {
                console.log("Calling verifyPayment API...");
                const token = localStorage.getItem('token');
                
                const response = await fetch('http://localhost:5000/api/payments/stripe/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        session_id: sessionId,
                        order_id: orderId 
                    })
                });

                const data = await response.json();
                console.log("Verify response:", data);

                if (data.success) {
                    console.log("Payment verified! Clearing cart...");
                    
                    // Clear cart
                    await CartApi.clearCart();
                    localStorage.removeItem('guestCart');
                    localStorage.removeItem('cartItems');
                    sessionStorage.clear();
                    
                    window.dispatchEvent(new Event('cart-updated'));
                    toast.success('Payment successful! Order confirmed.');
                    
                    setTimeout(() => {
                        navigate(`/orders/${orderId}`, { replace: true });
                    }, 2000);
                } else {
                    toast.error('Payment verification failed');
                    setTimeout(() => navigate('/checkout'), 2000);
                }
            } catch (error) {
                console.error("Verification error:", error);
                toast.error('Failed to verify payment');
                setTimeout(() => navigate('/checkout'), 2000);
            }
        };

        verifyAndClear();
    }, [sessionId, orderId, navigate]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-green-50">
            <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Your Payment</h2>
                <p className="text-gray-500">Please wait while we confirm your transaction...</p>
                <p className="text-xs text-gray-400 mt-4">Session: {sessionId?.substring(0, 20)}...</p>
            </div>
        </div>
    );
};

export default OrderSuccess;