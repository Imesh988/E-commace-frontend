import React, { useState, useEffect, useCallback } from "react";
import DataTabale from "../components/DataTable";
import { productApi, productImageApi, ProductDiscountApi } from "../services/api";
import Product from "../pages/Product";
import ProductImage from "../pages/ProductImage";
import ProductDiscount from "../pages/ProductDiscount";
import { CiEdit, CiTrash, CiSearch, CiDiscount1 } from "react-icons/ci";
import { TbPackage, TbPhoto, TbSettings2 } from "react-icons/tb";
import { FaShoppingBag } from "react-icons/fa";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import toast from "react-hot-toast";
import SellerNavbar from "../layout/SellerNavbar";


const BASE_URL = "http://localhost:5000";

const ProductManagement = () => {
    const [activeTab, setActiveTab] = useState("products");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [editingImage, setEditingImage] = useState(null);
    const [discounts, setDiscounts] = useState([]);
    const [editingDiscount, setEditingDiscount] = useState(null);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchTerm("");
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const request = searchTerm.trim() === ""
                ? await productApi.getAllProduct()
                : await productApi.getProductByText(searchTerm);
            setProducts(request.data?.data || request.data || []);
        } catch (err) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productImageApi.getAllProductImage();
            const data = response.data?.data || [];
            const filtered = searchTerm.trim() !== "" 
                ? data.filter(img => img.product_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                : data;
            setProductImages(filtered);
        } catch (error) {
            setProductImages([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const request = searchTerm.trim() === ""
                ? await ProductDiscountApi.getAllProductDiscount()
                : await ProductDiscountApi.getProductDiscountByText(searchTerm);
            setDiscounts(request.data?.data || request.data || []);
        } catch (err) {
            setDiscounts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (activeTab === "products") fetchProducts();
            if (activeTab === "images") fetchImages();
            if (activeTab === "discounts") fetchDiscounts();
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeTab, fetchImages]);

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Delete this product permanently?')) {
            try {
                await productApi.deleteProduct(id);
                toast.success("Product removed");
                fetchProducts();
            } catch (err) {
                toast.error("Operation failed");
            }
        }
    };

    const handleDeleteImage = async (id) => {
        if (window.confirm("Delete this image?")) {
            try {
                await productImageApi.deleteProductImage(id);
                toast.success("Image removed");
                fetchImages();
            } catch (err) {
                toast.error("Operation failed");
            }
        }
    };

    const handleDeleteDiscount = async (id) => {
        if (window.confirm('Remove this discount?')) {
            try {
                await ProductDiscountApi.deleteProductDiscount(id);
                toast.success("Discount removed");
                fetchDiscounts();
            } catch (err) {
                toast.error("Operation failed");
            }
        }
    };

    const productColumns = [
        { header: "SKU Code", key: "product_code" },
        { header: "Product Name", key: "product_name" },
        { header: "Unit Price", render: (row) => <span className="font-semibold text-slate-700">LKR {row.price}</span> },
        { header: "Category", key: "category" },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => { setEditingProduct(row); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><CiEdit size={20} /></button>
                    <button onClick={() => handleDeleteProduct(row.product_id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><CiTrash size={20} /></button>
                </div>
            )
        }
    ];

    const imageColumns = [
        {
            header: "Preview",
            render: (row) => (
                <div className="relative w-12 h-12">
                    <img
                        src={`${BASE_URL}${row.image.startsWith('/') ? row.image : `/${row.image}`}`}
                        alt="product"
                        className="w-full h-full object-cover rounded-xl border border-slate-100"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/100"; }}
                    />
                </div>
            )
        },
        {
            header: "Status",
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${row.is_primary === 1 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                    {row.is_primary === 1 ? <CheckCircleIcon size={12} /> : <XCircleIcon size={12} />}
                    {row.is_primary === 1 ? "Main Image" : "Secondary"}
                </span>
            )
        },
        { header: "Associated Product", key: "product_name" },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => { setEditingImage(row); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><CiEdit size={20} /></button>
                    <button onClick={() => handleDeleteImage(row.image_id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><CiTrash size={20} /></button>
                </div>
            )
        }
    ];

    const discountColumns = [
        { header: "Target Product", key: "product_name" },
        { header: "Type", render: (row) => <span className="capitalize text-indigo-600 font-medium">{row.discount_type}</span> },
        { header: "Benefit", render: (row) => <span className="font-bold text-slate-800">{row.discount_amount}</span> },
        {
            header: "Visibility",
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${row.status === 1 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                    {row.status === 1 ? <CheckCircleIcon size={12} /> : <XCircleIcon size={12} />}
                    {row.status === 1 ? "Enabled" : "Disabled"}
                </span>
            )
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => { setEditingDiscount(row); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><CiEdit size={20} /></button>
                    <button onClick={() => handleDeleteDiscount(row.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><CiTrash size={20} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <SellerNavbar />
            
            <div className="w-full px-4 lg:px-8 py-8">
                
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   

                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                        <button onClick={() => handleTabChange("products")} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "products" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Products</button>
                        <button onClick={() => handleTabChange("images")} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "images" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Gallery</button>
                        <button onClick={() => handleTabChange("discounts")} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "discounts" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>Discounts</button>
                    </div>
                </header>

                <div className="flex flex-col gap-10">
                    <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                         
                        </div>
                        {activeTab === "products" && <Product refreshProducts={fetchProducts} onProductAdded={fetchProducts} editingProduct={editingProduct} setEditingProduct={setEditingProduct} />}
                        {activeTab === "images" && <ProductImage editingImage={editingImage} onSaveSuccess={fetchImages} onCancel={() => setEditingImage(null)} />}
                        {activeTab === "discounts" && <ProductDiscount refreshProductDiscounts={fetchDiscounts} onProductDiscountAdded={fetchDiscounts} editingProductDiscount={editingDiscount} setEditingProductDiscount={setEditingDiscount} />}
                    </section>

                    <section className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    {activeTab === "products" ? <FaShoppingBag size={18}/> : activeTab === "images" ? <TbPhoto size={18}/> : <CiDiscount1 size={18}/>}
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg capitalize">{activeTab} Database</h3>
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={`Filter ${activeTab}...`}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="w-full overflow-hidden border-t border-slate-100">
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-64 gap-3">
                                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Refreshing Repository</p>
                                </div>
                            ) : (
                                <DataTabale
                                    columns={activeTab === "products" ? productColumns : activeTab === "images" ? imageColumns : discountColumns}
                                    data={activeTab === "products" ? products : activeTab === "images" ? productImages : discounts}
                                />
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;