import { useEffect, useState } from "react"
import { FaShoppingBag } from "react-icons/fa"
import { productApi, categoryAPI } from "../services/api";
import toast from "react-hot-toast";
import TextField from "../components/TextField";
import ComboBox from "../components/ComboBox";
import Button from "../components/Button";

const Product = ({
    editingProduct,
    refreshProducts,
    cancelEdit,
    setEditingProduct 
}) => {
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

     const generateProductId = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000); 
    return `PRO${randomDigits}`;
};

    const [productData, setProductData] = useState({
        product_id: generateProductId(),
        product_code: "",
        product_name: "",
        price: "",
        product_colors: "",
        category_id: "",
        status: 1,
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await categoryAPI.getAllCategory();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((cat) => ({
                    value: cat.category_id,
                    label: cat.category, 
                }));
                setCategoryOptions(options);
            } catch (error) {
                console.error("Category Load Failed", error)
            }
        };
        fetchCategory();
    }, []);

    useEffect(() => {
        if (editingProduct) {
            setProductData(editingProduct);
        }
    }, [editingProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validation = () => {
        let newError = {};

        if (!editingProduct && !productData.product_id) {
            newError.product_id = "Please enter the product ID";
        }
        if (!productData.product_code) newError.product_code = "Please enter the product code";
        if (!productData.product_name) newError.product_name = "Please enter the product name";
        if (!productData.price) newError.price = "Please enter the price";
        if (!productData.product_colors) newError.product_colors = "Please enter the product color";
        if (!productData.category_id) newError.category_id = "Please select the category";

        setErrors(newError);
        return Object.keys(newError).length === 0;
    }

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validation()) return;
    setLoading(true);

    try {
        if (editingProduct) {
            const { product_id, ...payload } = productData;
            
            const idValue = editingProduct.product_id; 

            console.log("Updating ID:", idValue); 

            await productApi.updateProduct(idValue, payload);
            alert('Product update successful !!');
        } else {
            await productApi.createProduct(productData);
            alert('Product added successful !!');
        }

        handleReset();
        if (refreshProducts) refreshProducts(); 
        if (cancelEdit) cancelEdit();
        
    } catch (error) {
        console.error("Error updating:", error);
        const errorMsg = error.response?.data?.msg || "Save Failed!";
        toast.error(errorMsg);
    } finally {
        setLoading(false);
    }
};

    const handleReset = () => {
        setProductData({
            product_id: generateProductId(),
            product_code: "",
            product_name: "",
            category_id: "",
            price: "",
            product_colors: "",
            status: 1,
        });
        setErrors({});
        if (setEditingProduct) setEditingProduct(null);
        if (cancelEdit) cancelEdit();
    };

    const statusOptions = [
        { value: 1, label: "Active" },
        { value: 0, label: "Inactive" }
    ];

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <FaShoppingBag className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                    {editingProduct ? "Update Product Details" : "Save New Product"}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
                    
                    <TextField
                        label="Product Id"
                        name="product_id"
                        value={productData.product_id}
                        onChange={handleChange}
                        placeholder="Ex : 1001"
                        disabled={true}
                        error={errors.product_id}
                    />

                    <TextField
                        label="Product Code"
                        name="product_code"
                        value={productData.product_code}
                        onChange={handleChange}
                        placeholder="Ex : LAP10"
                        error={errors.product_code}
                    />

                    <TextField
                        label="Product Name"
                        name="product_name"
                        value={productData.product_name}
                        onChange={handleChange}
                        placeholder="Ex : 8th Gen Laptop"
                        error={errors.product_name}
                    />

                    <ComboBox
                        label="Assign Category"
                        name="category_id"
                        value={productData.category_id}
                        onChange={handleChange}
                        options={categoryOptions}
                        placeholder="Select Category"
                        error={errors.category_id}
                    />

                    <TextField
                        label="Price"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        placeholder="EX: 150000"
                        error={errors.price} 
                    />

                    <TextField
                        label="Product Colors"
                        name="product_colors"
                        value={productData.product_colors}
                        onChange={handleChange}
                        placeholder="Ex: Silver, Black, Red"
                        error={errors.product_colors} 
                    />

                    <ComboBox
                        label="Status"
                        name="status"
                        value={productData.status}
                        onChange={handleChange}
                        options={statusOptions}
                        placeholder="Select Status"
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
                        title={loading ? "Processing..." : (editingProduct ? "Update Product" : "Save Product")}
                        variant={editingProduct ? "warning" : "primary"}
                        icon={editingProduct ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    )
}

export default Product;