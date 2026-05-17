// src/components/checkout/OrderSummary.jsx
import React from 'react';
import { FaShoppingBag, FaTruck, FaTag } from 'react-icons/fa';

const OrderSummary = ({ items, subtotal, shipping, total, discount = 0 }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FaShoppingBag className="text-primary-500" />
                Order Summary
            </h3>
            
            {/* Order Items */}
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name || item.productName}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-800">LKR {((item.price || item.unitPrice) * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            
            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
                {discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                        <span className="flex items-center gap-1">
                            <FaTag className="w-3 h-3 text-green-500" />
                            Discount
                        </span>
                        <span className="text-green-600">- LKR {discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                        <FaTruck className="w-3 h-3" />
                        Shipping
                    </span>
                    <span>LKR {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-primary-600">LKR {total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;