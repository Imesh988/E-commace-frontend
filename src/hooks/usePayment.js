// src/hooks/usePayment.js
import { useState } from 'react';
import { paymentApi } from '../services/api';


export const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleStripePayment = async (orderId, customerEmail) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await paymentApi.createStripeCheckout(orderId, customerEmail);
            
            // Check the response structure from your backend
            if (response.data?.success && response.data?.checkoutUrl) {
                window.location.href = response.data.checkoutUrl;
                return { success: true };
            } else if (response.success && response.checkoutUrl) {
                window.location.href = response.checkoutUrl;
                return { success: true };
            } else {
                throw new Error(response.data?.msg || response.msg || 'Failed to create checkout session');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.message || 'Payment initialization failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const handleCashOnDelivery = async (orderId, amount) => {
        setLoading(true);
        setError(null);
        
        try {
            const paymentDetails = {
                order_id: orderId,
                payment_method: 'Cash On Delivery',
                amount: amount,
                payment_status_code: 2 // Completed
            };
            
            const response = await paymentApi.processPayment(paymentDetails);
            
            if (response.data?.msg || response.msg) {
                return { success: true, orderId };
            } else {
                throw new Error(response.data?.msg || response.msg || 'Failed to process COD');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.message || 'COD payment failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (sessionId, orderId) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await paymentApi.verifyStripePayment(sessionId, orderId);
            
            // Handle different response structures
            const data = response.data || response;
            
            if (data.success) {
                return { 
                    success: true, 
                    payment: data.payment 
                };
            } else {
                throw new Error(data.msg || 'Payment verification failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.message || 'Verification failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        handleStripePayment,
        handleCashOnDelivery,
        verifyPayment,
        setError
    };
};