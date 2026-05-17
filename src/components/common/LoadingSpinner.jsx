// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = "Processing your payment..." }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl max-w-md mx-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="text-gray-700 font-medium mt-6">{message}</p>
                <p className="text-gray-400 text-sm mt-2">Please don't close this window</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;