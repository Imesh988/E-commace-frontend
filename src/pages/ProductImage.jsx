import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { productImageApi, productApi } from "../services/api";
import TextField from "../components/TextField";
import ComboBox from "../components/ComboBox";
import Button from "../components/Button";
import { CiImageOn } from "react-icons/ci";

const ProductImage = ({ editingImage, onSaveSuccess, onCancel }) => {
    const [productOptions, setProductOptions] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        product_id: "",
        is_primary: 0,
        existingImage: "",
        newFile: null
    });

    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const response = await productApi.getAllProduct();
                const productsData = response.data?.data || [];
                const options = productsData.map(pro => ({
                    value: pro.product_id,
                    label: `${pro.product_name} (ID: ${pro.product_id})`
                }));
                setProductOptions(options);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                toast.error("Could not load product list");
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (editingImage) {
            setFormData({
                product_id: editingImage.product_id || "",
                is_primary: editingImage.is_primary || 0,
                existingImage: editingImage.image || "",
                newFile: null
            });
        } else {
            handleReset();
        }
    }, [editingImage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, newFile: file }));
            if (errors.newFile) setErrors(prev => ({ ...prev, newFile: null }));
        }
    };

    const validation = () => {
        let newErrors = {};
        let isValid = true;

        if (!formData.product_id) {
            newErrors.product_id = "Please select a product.";
            isValid = false;
        }

        if (!formData.newFile && !editingImage) {
            newErrors.newFile = "Please select an image file.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validation()) {
            toast.error("Please correct the errors in the form.");
            return;
        }
        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("product_id", formData.product_id);
        formDataToSend.append("is_primary", formData.is_primary);
        if (formData.newFile) {
            formDataToSend.append("image", formData.newFile);
        }

        try {
            if (editingImage) {
                await productImageApi.updateProductImage(editingImage.image_id, formDataToSend);
                toast.success("Product image updated successfully");
            } else {
                await productImageApi.createProductImage(formDataToSend);
                toast.success("Product image added successfully");
            }
            handleReset();
            if (onSaveSuccess) onSaveSuccess();
        } catch (error) {
            console.error("Save error:", error);
            toast.error(error.response?.data?.msg || "Failed to save product image");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            product_id: "",
            is_primary: 0,
            existingImage: "",
            newFile: null
        });
        setErrors({});
        if (onCancel) onCancel();
    };

    const primaryOptions = [
        { value: 1, label: "Yes (Primary)" },
        { value: 0, label: "No (Not Primary)" }
    ];

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <CiImageOn className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                    {editingImage ? "Update Product Image" : "Add Product Image"}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
                    <ComboBox
                        label="Select Product"
                        name="product_id"
                        value={formData.product_id}
                        onChange={handleChange}
                        options={productOptions}
                        placeholder="Choose a product"
                        error={errors.product_id}
                        disabled={loadingProducts}
                    />

                    <ComboBox
                        label="Primary Image"
                        name="is_primary"
                        value={formData.is_primary}
                        onChange={handleChange}
                        options={primaryOptions}
                        placeholder="Is this the primary image?"
                        error={errors.is_primary}
                    />

                    <div className="flex flex-col w-full mb-4">
                        <label className="text-xs font-semibold text-gray-400 mb-1">Image File</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full py-2 bg-transparent border-b border-gray-200 focus:border-emerald-500 outline-none transition-all text-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {formData.existingImage && !formData.newFile && (
                            <p className="text-[10px] text-gray-400 mt-1">Current: {formData.existingImage.split('/').pop()}</p>
                        )}
                        {formData.newFile && (
                            <p className="text-[10px] text-green-600 mt-1">Selected: {formData.newFile.name}</p>
                        )}
                        {errors.newFile && <span className="text-[10px] text-red-500 mt-1">{errors.newFile}</span>}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <Button
                        title="Cancel"
                        variant="outline"
                        icon="✕"
                        onClick={handleReset}
                        type="button"
                    />
                    <Button
                        title={loading ? "Processing..." : (editingImage ? "Update Image" : "Save Image")}
                        variant={editingImage ? "warning" : "primary"}
                        icon={editingImage ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
};

export default ProductImage;