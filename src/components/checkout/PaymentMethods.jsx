// src/components/checkout/PaymentMethods.jsx
import React, { useState } from 'react';
import { FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaLock } from 'react-icons/fa';

const PaymentMethods = ({ onPaymentSelect, loading }) => {
    const [selectedMethod, setSelectedMethod] = useState('card');

    const methods = [
        {
            id: 'card',
            name: 'Credit / Debit Card',
            icon: FaCreditCard,
            description: 'Pay securely with Stripe',
            color: 'text-primary-500',
            logos: ['Visa', 'Mastercard', 'Amex']
        },
        {
            id: 'cod',
            name: 'Cash On Delivery',
            icon: FaMoneyBillWave,
            description: 'Pay when you receive the order',
            color: 'text-secondary-500',
            logos: []
        }
    ];

    const handleSelect = (methodId) => {
        setSelectedMethod(methodId);
        onPaymentSelect(methodId);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FaLock className="text-primary-500" />
                Payment Methods
            </h3>
            
            <div className="space-y-3 mb-6">
                {methods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    
                    return (
                        <div
                            key={method.id}
                            onClick={() => !loading && handleSelect(method.id)}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                isSelected 
                                    ? 'border-primary-500 bg-primary-50 shadow-sm' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 ${method.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <h4 className="font-semibold text-gray-800">{method.name}</h4>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                                    {method.logos.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {method.logos.map((logo, idx) => (
                                                <span key={idx} className="text-xs text-gray-400">{logo}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Security Badge */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <FaShieldAlt className="w-4 h-4 text-green-500" />
                    <span>Your payment information is secure & encrypted</span>
                </div>
                <div className="flex justify-center gap-3 mt-3">
                    <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-6 opacity-60" />
                    <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" className="h-6 opacity-60" />
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;