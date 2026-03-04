import React, { useEffect, useState } from "react";
import { TbCategoryPlus } from "react-icons/tb";
import Button from "../components/Button";
import { productApi, productImageApi } from "../services/api";
import ComboBox from "../components/ComboBox";

const ProductImage = ({ onProductImageAdded, editingProductImage, cancelEdit }) => {
    const IMAGE_BASE_URL = "http://localhost:5000/public/product/images/";

    const [productImageData, setProductImageData] = useState({
        status: 1,
        image: null,
        is_primary: false,
        product_id: "",
    });

    const [loading, setLoading] = useState(false);
    const [productOptions, setProductOptions] = useState([]);
    const isEditing = !!editingProductImage?.image_id;
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const resProduct = await productApi.getAllProduct();
                const dataProduct = resProduct.data && resProduct.data.data ? resProduct.data.data : [];
                const optionsProduct = dataProduct.map((item) => ({
                    value: item.product_id,
                    label: item.product_name,
                }));
                setProductOptions(optionsProduct);
            } catch (error) {
                console.log("Error fetching Products:", error);
                alert("Failed to load products.");
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (isEditing && editingProductImage) {
            setProductImageData({
                status: editingProductImage.status || 1,
                image: null,
                is_primary: !!editingProductImage.is_primary,
                product_id: editingProductImage.product_id || "",
            });

            if (editingProductImage.image) {
                let imagePath = editingProductImage.image;
                if (!imagePath.startsWith('/')) {
                    imagePath = `/${imagePath}`;
                }
                setPreviewImage(`${IMAGE_BASE_URL}${imagePath.replace('public/product/images/', '')}`);
            } else {
                setPreviewImage(null);
            }
        } else {
            resetForm();
        }
    }, [isEditing, editingProductImage]);

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (type === 'file') {
            const file = files[0];
            setProductImageData((prev) => ({
                ...prev,
                [name]: file,
            }));

            if (file) {
                setPreviewImage(URL.createObjectURL(file));
            } else {
                if (isEditing && editingProductImage?.image) {
                    let imagePath = editingProductImage.image;
                    if (!imagePath.startsWith('/')) {
                        imagePath = `/${imagePath}`;
                    }
                    setPreviewImage(`${IMAGE_BASE_URL}${imagePath.replace('public/product/images/', '')}`);
                } else {
                    setPreviewImage(null);
                }
            }
        } else {
            setProductImageData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataToSend = new FormData();

        formDataToSend.append("product_id", productImageData.product_id);
        formDataToSend.append("status", productImageData.status);
        formDataToSend.append("is_primary", productImageData.is_primary ? '1' : '0');

        if (productImageData.image) {
            formDataToSend.append("image", productImageData.image);
        } else if (isEditing && editingProductImage?.image && !productImageData.image) {
            
        }

        try {
            if (!productImageData.product_id) {
                alert("Please select a product.");
                setLoading(false);
                return;
            }
            if (!isEditing && !productImageData.image) {
                alert("Product Image is required for new entries!");
                setLoading(false);
                return;
            }

            if (isEditing) {
                await productImageApi.updateProductImage(editingProductImage.image_id, formDataToSend);
                alert("Product Image updated successfully!");
            } else {
                await productImageApi.createProductImage(formDataToSend);
                alert("Product Image added successfully!");
            }

            if (typeof onProductImageAdded === 'function') {
                onProductImageAdded();
            }
            resetForm();
            if (cancelEdit) cancelEdit();

        } catch (err) {
            console.error("Error submitting product image:", err);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setProductImageData({
            status: 1,
            image: null,
            is_primary: false,
            product_id: "",
        });
        setPreviewImage(null);
    };

    const handleCancel = () => {
        resetForm();
        if (cancelEdit) cancelEdit();
    };

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white/80 backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 text-white">
                    <TbCategoryPlus size={24} />
                </div>
                <h2 className="text-2xl font-bold text-emerald-700">
                    {isEditing ? "Update Product Image" : "Add New Product Image"}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400"> Product Image {isEditing ? "(Select new to change)" : "(Required for new entry)"}</label>
                        <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
                                    alt="Product Preview"
                                />
                            )}
                            <input
                                type="file"
                                name="image"
                                onChange={handleChange}
                                required={!isEditing}
                                className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                            />
                            {!previewImage && !isEditing && (
                                <span className="text-gray-500 text-sm">No file selected</span>
                            )}
                            {isEditing && !previewImage && editingProductImage?.image && (
                                <span className="text-gray-500 text-sm">Existing file: {editingProductImage.image.split('/').pop()}</span>
                            )}
                        </div>
                    </div>

                    <ComboBox
                        label="Assign Product"
                        name="product_id"
                        value={productImageData.product_id}
                        onChange={handleChange}
                        options={productOptions}
                        placeholder="Select Product"
                    />

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            id="is_primary"
                            type="checkbox"
                            name="is_primary"
                            checked={productImageData.is_primary}
                            onChange={handleChange}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_primary" className="text-sm font-semibold text-gray-700">Set as Primary Image</label>
                    </div>

                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <Button
                        title="Cancel"
                        variant="outline"
                        icon="✕"
                        onClick={handleCancel}
                        type="button"
                    />

                    <Button
                        title={loading ? "Processing..." : (isEditing ? "Update Image" : "Save Image")}
                        variant={isEditing ? "warning" : "primary"}
                        icon={isEditing ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
};

export default ProductImage;