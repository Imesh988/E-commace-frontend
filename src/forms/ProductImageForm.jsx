import React, { useState, useEffect, useCallback } from "react";
import DataTabale from "../components/DataTable";
import { CiEdit, CiSearch, CiTrash } from "react-icons/ci";
import { TbCategoryPlus } from "react-icons/tb";
import Navbar from "../layout/Navbar";
import toast from "react-hot-toast";
import { productImageApi } from "../services/api";
import ProductImage from "../pages/ProductImage";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

const BASE_URL = "http://localhost:5000";
const IMAGE_PATH = "/public/product/images/";
const FULL_IMAGE_URL = `${BASE_URL}${IMAGE_PATH}`;

const ProductImageForm = () => {
    const [productImages, setProductImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingProductImage, setEditingProductImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProductImages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productImageApi.getAllProductImage();
            console.log(response);
            
            const receivedData = response.data && response.data.data ? response.data.data : [];
            setProductImages(receivedData);
            console.log(receivedData);

        } catch (error) {
            console.error("Fetch error:", error);
            setProductImages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductImages();
    }, [fetchProductImages]);

    const productImageDelete = async (id) => {
       if(window.confirm('Are you sure you want to delete this product image ?')){
        try {
            await productImageApi.deleteProductImage(id);
            alert("Product image deleted successfully!");
            fetchProductImages();
        } catch (error) {
            console.error("Delete Error:", error);
            alert(error.response?.data?.message || "Delete Failed!");
        }
       }
    };

    const ProductImageColumns = [
        {
            header: "Image",
            render: (row) => (
                <div className="flex gap-2">
                    {row.image && (
                        <img
                            src={`${BASE_URL}${row.image.startsWith('/') ? row.image : `/${row.image}`}`}
                            alt="img1"
                            className="w-12 h-12 object-cover rounded-xl border-2 border-white shadow-sm"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
                        />
                    )}
                </div>
            )
        },
        {
            header: "Primary",
            render: (row) => (
                <span
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                        ${row.is_primary === 1
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                            : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20"
                        }
                    `}
                >
                    {row.is_primary === 1 ? (
                        <>
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                            Primary
                        </>
                    ) : (
                        <>
                            <XCircleIcon className="h-4 w-4 text-rose-500" aria-hidden="true" />
                            Not Primary
                        </>
                    )}
                </span>
            )
        },
        {
            header: "Product",
            key: "product_name"
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setEditingProductImage(row)}
                        className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition"
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => productImageDelete(row.image_id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                        title="Delete"
                    >
                        <CiTrash size={24} />
                    </button>
                </div>
            )
        }
    ];

    const filteredProductImages = productImages.filter(imageItem =>
        imageItem.product_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imageItem.image?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-6">
                <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-12 items-center">

                    <ProductImage
                        onProductImageAdded={fetchProductImages}
                        editingProductImage={editingProductImage}
                        cancelEdit={() => setEditingProductImage(null)}
                    />

                    <div className="w-full ">

                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-6">

                            <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                                <TbCategoryPlus />
                                <span>Product Image Management</span>
                            </h2>

                            <div className="relative w-full md:w-96 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <CiSearch className="h-6 w-6 text-emerald-500 font-bold" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by category name..."
                                    className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md transition-all text-gray-700 shadow-sm placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="backdrop-blur-xl p-8 overflow-hidden">
                            <DataTabale columns={ProductImageColumns} data={filteredProductImages} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductImageForm;