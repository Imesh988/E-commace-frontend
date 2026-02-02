import { useEffect, useState } from "react";
import { CiDiscount1 } from "react-icons/ci";
import { MdCancel, MdUpdate } from "react-icons/md";
import { IoIosSave } from "react-icons/io";
import toast from "react-hot-toast";
import { discountAPI } from "../services/api";
import { productAPI } from "../services/api";

export const ProductDiscountForm = ({ onCancel, refresh, editingDiscount }) => {

    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        discount_type: "",
        product_id: "",
        discount_amount: "",
        status: 1,
    });

    /* load products */
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await productAPI.getAllProduct();
                setProducts(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        loadProducts();
    }, []);

    /* handle change */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    /* submit */
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    
    //     try {
    //         const res = await discountAPI.createProductDiscount({
    //             product_id: Number(formData.product_id),
    //             discount_type: formData.discount_type,
    //             discount_amount: Number(formData.discount_amount),
    //             status: Number(formData.status),
    //         });
    
    //         console.log("API RES 👉", res.data);
    
    //         if (res.status === 201) {
    //             toast.success(res.data.message || "Discount saved successfully");
    
    //             setFormData({
    //                 discount_type: "",
    //                 product_id: "",
    //                 discount_amount: "",
    //                 status: 1,
    //             });
    
    //             refresh?.();
    //             onCancel?.();
    //         }
    
    //     } catch (error) {
    //         console.error("API ERROR 👉", error);
    //         toast.error(error.response?.data?.message || "Discount save failed");
    //     }
    // };

    useEffect(() => {
        if (editingDiscount) {
            setFormData({
                discount_type: editingDiscount.discount_type,
                product_id: editingDiscount.product_id,
                discount_amount: editingDiscount.discount_amount,
                status: editingDiscount.status,
            });
        }
    }, [editingDiscount]);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const payload = {
                product_id: Number(formData.product_id),
                discount_type: formData.discount_type,
                discount_amount: Number(formData.discount_amount),
                status: Number(formData.status),
            };
    
            let res;
    
            if (editingDiscount) {
                // 🔵 UPDATE
                res = await discountAPI.updateProductDiscount(
                    editingDiscount.id,
                    payload
                );
            } else {
                // 🟢 CREATE
                res = await discountAPI.createProductDiscount(payload);
            }
    
            toast.success(
                editingDiscount ? "Discount updated successfully" : "Discount saved successfully"
            );
    
            resetForm();
            refresh?.();
            onCancel?.();
    
        } catch (error) {
            console.error(error);
            toast.error("Operation failed");
        }
    };
    
    const resetForm = () => {
        setFormData({
            discount_type: "",
            product_id: "",
            discount_amount: "",
            status: 1,
        });
    };
    
    
    

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-white flex justify-center p-6">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8">

                <div className="flex items-center mb-8 gap-4">
                    <div className="text-white p-3 rounded-xl bg-emerald-500">
                        <CiDiscount1 size={22} />
                    </div>
                    <h1 className="text-4xl font-semibold text-emerald-600">
                        {editingDiscount ? "Update Discount" : "Add New Discount"}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                        {/* Discount Type */}
                        <div>
                            <label className="text-xl text-gray-500">Discount Type</label>
                            <div className="flex gap-6 mt-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="discount_type"
                                        value="percentage"
                                        checked={formData.discount_type === "percentage"}
                                        onChange={handleChange}
                                    />
                                    Percentage (%)
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="discount_type"
                                        value="fixed"
                                        checked={formData.discount_type === "fixed"}
                                        onChange={handleChange}
                                    />
                                    Fixed Amount
                                </label>
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <label className="text-xl text-gray-500">Product</label>
                            <select
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleChange}
                                required
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2"
                            >
                                <option value="">Select product</option>
                                {products.map((p) => (
                                    <option key={p.product_id} value={p.product_id}>
                                        {p.product_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="text-xl text-gray-500">Amount</label>
                            <input
                                type="number"
                                name="discount_amount"
                                value={formData.discount_amount}
                                onChange={handleChange}
                                required
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-xl text-gray-500">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2"
                            >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-10">
                        <button
                            type="button"
                            onClick={() => {
                               resetForm();
                               onCancel?.();
                            }}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                            <MdCancel /> Cancel
                        </button>

                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 text-white shadow hover:bg-emerald-600"
                        >
                           
                            {editingDiscount ? <MdUpdate size={18}/> : <IoIosSave size={18}/> }
                            {editingDiscount ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
