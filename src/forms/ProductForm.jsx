import React, { useState, useEffect } from "react";
import DataTabale from "../components/DataTable";
import { CiEdit, CiTrash } from "react-icons/ci";
import SellerSave from "../pages/SellerSave";
import { TbUser } from "react-icons/tb";
import { productApi } from "../services/api";
import Product from "../pages/Product";
import Navbar from "../layout/Navbar";
import { FaShoppingBag } from "react-icons/fa";


const ProductForm = () => {
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [profile, setProfile] = useState(null);


    const fetchProduct = async () => {
        setLoading(true);
        try {
            const request = searchTerm.trim() === ""
                ? await productApi.getAllProduct()
                : await productApi.getProductByText(searchTerm);

            const receivedData = request.data?.data || request.data || [];
            setProduct(receivedData);
        } catch (err) {
            console.log("Fetch error:", err);
            setProduct([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProduct();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);



    const productDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product ?')) {
            try {
                setLoading(true);
             
                await productApi.deleteProduct(id);
                alert("Product deleted successfully!");
                fetchProduct();
            } catch (error) {
                console.error("Delete Error:", error);
                alert(error.response?.data?.message || "Delete Failed!");
            } finally {
                setLoading(false);
            }
        }
    }

    const productColumns = [
        {
            header: "Product code",
            key: "product_code"
        },
        {
            header: "Product name",
            key: "product_name"
        },
        {
            header: "Price",
            key: "price"
        },
        {
            header: "Product colors",
            key: "product_colors"
        },
        {
            header: "Category",
            key: "category"
        },
      
        {
            header: "Actions",
            render: (row) => (
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setEditingProduct(row)}
                        className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition"
                        title="Edit"
                    >
                        <CiEdit size={24} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => productDelete(row.product_id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                        title="Delete"
                    >
                        <CiTrash size={24} />
                    </button>
                </div>
            )
        }
    ];

    return (
            <>
          <Navbar />
            
            <div className="relative min-h-screen bg-white overflow-x-hidden p-6 mt-5">
                <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-12 items-center">
                    
                    <Product
                        refreshProducts={fetchProduct}
                        onProductAdded={fetchProduct}
                        editingProduct={editingProduct}
                        setEditingProduct={setEditingProduct}
                    />

                    <div className="w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-6">
                            <h2 className="text-3xl font-bold text-green-600 flex items-center gap-3">
                                <FaShoppingBag />
                                <span>Product Management</span>
                            </h2>

                            <div className="relative w-full md:w-96 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <TbUser className="h-6 w-6 text-emerald-500 font-bold" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by ......."
                                    className="block w-full pl-12 pr-4 py-3 bg-white/60 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md transition-all text-gray-700 shadow-sm placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="backdrop-blur-xl p-8 overflow-hidden rounded-[40px]">
                            {loading && product.length === 0 ? (
                                <div className="flex justify-center p-10">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                                </div>
                            ) : (
                                <DataTabale
                                    columns={productColumns}
                                    data={product}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )


}


export default ProductForm;