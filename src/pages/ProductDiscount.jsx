import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TextField from "../components/TextField";
import ComboBox from "../components/ComboBox";
import Button from "../components/Button";
import { productApi, ProductDiscountApi } from "../services/api";
import { CiDiscount1 } from "react-icons/ci";


const ProductDiscount = ({
    editingProductDiscount,
    refreshProductDiscounts,
    cancelEdit,
    setEditingProductDiscount
}) => {
    const [productOptions, setProductOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [productDiscountData, setProductDiscountData] = useState({
        product_id: "",
        discount_type: "", 
        discount_amount: "",
        status: 1, 
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productApi.getAllProduct();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((pro) => ({
                    value: pro.product_id,
                    label: pro.product_name,
                }));
                setProductOptions(options);
            } catch (error) {
                console.error("Product Load Failed", error);
                toast.error("Failed to load products."); 
            }
        };
        fetchProduct();
    }, []);

    useEffect(() => {
        if (editingProductDiscount) {
            setProductDiscountData(editingProductDiscount);
        } else {
            handleReset();
        }
    }, [editingProductDiscount]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductDiscountData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validation = () => {
        let newErrors = {};
        let isValid = true;

        if (!productDiscountData.product_id) {
            newErrors.product_id = "Please select the product.";
            isValid = false;
        }

        if (!productDiscountData.discount_type) {
            newErrors.discount_type = "Please select the discount type.";
            isValid = false;
        }

        if (!productDiscountData.discount_amount) {
            newErrors.discount_amount = "Please enter the discount amount.";
            isValid = false;
        } else {
            const amount = parseFloat(productDiscountData.discount_amount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.discount_amount = "Please enter a valid positive number for discount amount.";
                isValid = false;
            } else if (productDiscountData.discount_type === "percentage" && amount > 100) {
                newErrors.discount_amount = "Percentage discount cannot exceed 100%.";
                isValid = false;
            }
           
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

        try {
            if (editingProductDiscount) {
                await ProductDiscountApi.updateProductDiscount(editingProductDiscount.id, productDiscountData);
                alert('Product discount updated successfully!'); 
            } else {
                await ProductDiscountApi.createProductDiscount(productDiscountData);
               alert('Product discount added successfully!');
            }

            handleReset();
            if (refreshProductDiscounts) refreshProductDiscounts();
            if (cancelEdit) cancelEdit();

        } catch (error) {
            console.error("Error saving product discount:", error);
            const errorMsg = error.response?.data?.msg || "Failed to save product discount!";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setProductDiscountData({
            product_id: "",
            discount_type: "",
            discount_amount: "",
            status: 1,
        });
        setErrors({}); 
        if (setEditingProductDiscount) setEditingProductDiscount(null); 
        if (cancelEdit) cancelEdit(); 
    };

    const getDiscountAmountLabel = () => {
        if (productDiscountData.discount_type === "percentage") {
            return "Discount Percentage (%)";
        } else if (productDiscountData.discount_type === "fixed") {
            return "Fixed Discount Amount (LKR)";
        }
        return "Discount Amount";
    };

    const getDiscountAmountPlaceholder = () => {
        if (productDiscountData.discount_type === "percentage") {
            return "Enter percentage (e.g., 10, 25.5)";
        } else if (productDiscountData.discount_type === "fixed") {
            return "Enter fixed amount (e.g., 500.00, 1250.50)";
        }
        return "Enter discount Amount";
    };

    const statusOptions = [
        { value: 1, label: "Available" }, 
        { value: 0, label: "Unavailable" }
    ];

    const discountTypr = [
        { value: "percentage", label: "Percentage" },
        { value: "fixed", label: "Fixed" }
    ];

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <CiDiscount1 className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                    {editingProductDiscount ? "Update Product Discount" : "Add Product Discount"} {/* " Update" -> "Update" for consistency */}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">

                    <ComboBox
                        label="Assign Product"
                        name="product_id"
                        value={productDiscountData.product_id}
                        onChange={handleChange}
                        options={productOptions}
                        placeholder="Select Product"
                        error={errors.product_id}
                    />


                    <ComboBox
                        label="Discount Type"
                        name="discount_type"
                        value={productDiscountData.discount_type}
                        onChange={handleChange}
                        options={discountTypr}
                        placeholder="Select Discount Type"
                        error={errors.discount_type} 
                    />


                    <TextField
                        label={getDiscountAmountLabel()}
                        name="discount_amount"
                        value={productDiscountData.discount_amount}
                        onChange={handleChange}
                        placeholder={getDiscountAmountPlaceholder()}
                        error={errors.discount_amount}
                        type="number"
                        step="any" 
                    />


                    <ComboBox
                        label="Status"
                        name="status"
                        value={productDiscountData.status}
                        onChange={handleChange}
                        options={statusOptions}
                        placeholder="Select Status"
                        error={errors.status}
                    />
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
                        title={loading ? "Processing..." : (editingProductDiscount ? "Update Discount" : "Save Discount")}
                        variant={editingProductDiscount ? "warning" : "primary"}
                        icon={editingProductDiscount ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
};

export default ProductDiscount;