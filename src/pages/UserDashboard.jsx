// src/pages/UserDashboard.js (ඔබේ UserDashboard file එකේ path එක)
// ඉහළ කොටසේ imports සහ component logic එලෙසම තබා ගන්න.
// මම මෙහිදී UI කොටස පමණක් ලබා දෙමි.

import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../api/axiosConfig';
import Navbar from '../layout/Navbar';
import { productImageApi } from "../services/api";
import { CiSearch, CiShoppingCart } from "react-icons/ci"; // CiSearch icon එකත් අවශ්‍ය වේ.
import { LuLeaf } from "react-icons/lu"; // EcoShop තේමාවට ගැලපෙන icon එකක්

const BASE_URL = "http://localhost:5000";

const UserDashboard = () => {
    const [productImages, setProductImages] = useState([]);
    const [loadingProductImages, setLoadingProductImages] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // Search bar එකට අවශ්‍ය state එක

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    useEffect(() => {
        axiosInstance.get('/auth/verify-profile')
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }, []);

    const fetchProductImages = useCallback(async () => {
        setLoadingProductImages(true);
        try {
            const response = await productImageApi.getAllProductImage();
            const receivedData = response.data && response.data.data ? response.data.data : [];
            setProductImages(receivedData);
        } catch (error) {
            console.error("Fetch Product Images Error in Dashboard:", error);
            setProductImages([]);
        } finally {
            setLoadingProductImages(false);
        }
    }, []);

    useEffect(() => {
        fetchProductImages();
    }, [fetchProductImages]);

    const filteredProductImages = productImages.filter(imageItem =>
        imageItem.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imageItem.image?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
         <>
           

            <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-yellow-50 font-sans overflow-hidden">
                <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 z-0"></div>
                <div className="absolute bottom-1/4 right-1/2 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"></div>
 <Navbar />

                <div className="relative z-10 max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    <div className="mt-8 relative z-10 p-6 rounded-xl overflow-hidden
                                    bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-100 border border-emerald-200 shadow-lg">

                        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob z-0"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000 z-0"></div>


                        <h2 className="relative z-10 text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-emerald-700">Flash</span> Sale
                        </h2>

                        {loadingProductImages ? (
                            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse">
                                {[...Array(10)].map((_, index) => (
                                    <div key={index} className="bg-gray-200 rounded-lg overflow-hidden shadow-sm h-72"></div>
                                ))}
                            </div>
                        ) : filteredProductImages.length > 0 ? (
                            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredProductImages.map((productImage) => (
                                    <div
                                        key={productImage.image_id}
                                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative group transform hover:-translate-y-1 border border-gray-100"
                                    >
                                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                            {productImage.image ? (
                                                <img
                                                    src={`${BASE_URL}${productImage.image.startsWith('/') ? productImage.image : `/${productImage.image}`}`}
                                                    alt={productImage.product_name || "Product Image"}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/200x150?text=No+Image"; }}
                                                />
                                            ) : (
                                                <img
                                                    src="https://via.placeholder.com/200x150?text=No+Image"
                                                    alt="No Product Image"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                                                -20%
                                            </span>

                                            <button
                                                className="absolute bottom-2 right-2 p-2 bg-emerald-600 text-white rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 transform shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                                title="Add to Cart"
                                            >
                                                <CiShoppingCart size={20} className="stroke-2" />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-base font-semibold text-gray-800 mb-1 leading-tight truncate" title={productImage.product_name}>
                                                {productImage.product_name || "Untitled Product"}
                                            </h3>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <p className="text-xl font-bold text-emerald-700">
                                                    LKR {productImage.price ? parseFloat(productImage.price).toFixed(2) : "N/A"}
                                                </p>
                                                <p className="text-sm text-gray-500 line-through">LKR 1,500.00</p>
                                            </div>

                                            <div className="flex items-center text-yellow-400 text-sm">
                                                <span>4.5</span>
                                                <span className="ml-1 text-gray-500">(120 reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                                <p className="text-xl text-gray-600">No products found for your search. Try adjusting your filters!</p>
                            </div>
                        )}
                    </div>

                    

                </div> 
            </div>
        </>
    );
};

export default UserDashboard;