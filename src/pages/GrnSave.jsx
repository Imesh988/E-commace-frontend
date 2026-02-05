import React, { useEffect, useState } from "react";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { GrNodes } from "react-icons/gr";
import ComboBox from "../components/ComboBox";
import { supplierApi, productApi, grnApi } from "../services/api";


const GRNSave = ({ onGrnAdded, editingGrn, setEditingGrn }) => {
    const [formData, setFormData] = useState({
        supplier_id: '',
        product_id: '',
        date: '',
        qty: '',
        cost_price: '',
        sell_price: '',
        total: ''
    });

    const [supplier, setSupplier] = useState([]);
    const [product, setProduct] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetachSupplierAndProduct = async () => {
            try {
                const res = await supplierApi.getAllSupplier();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((item) => ({
                    value: item.supplier_id,
                    label: item.supplier_name,
                }));
                const resProduct = await productApi.getAllProduct();
                const dataProduct = resProduct.data && resProduct.data.data ? resProduct.data.data : [];
                const optionsProduct = dataProduct.map((item) => ({
                    value: item.product_id,
                    label: item.product_name,
                }));
                setSupplier(options);
                setProduct(optionsProduct)



            } catch (error) {
                console.log("Error fetching GRN:", error);
            }
        }

        fetachSupplierAndProduct();
    }, [])

    const validation = () => {
        let newErrors = {};

        if (!formData.supplier_id) {
            newErrors.supplier_id = "please select the supplier "
        }

        if (!formData.product_id) {
            newErrors.product_id = "please select the product"
        }

        if (!formData.date) {
            newErrors.date = "Please enter the date "
        }

        if (!formData.qty) {
            newErrors.qty = "Please enter the quentity"
        }

        if (!formData.cost_price) {
            newErrors.cost_price = "Please enter the cost price"
        }

        if (!formData.sell_price) {
            newErrors.sell_price = "Please enter the sell price "
        }

        if (!formData.total) {
            newErrors.total = "Please enter the total"
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    useEffect(() => {
        if (editingGrn) {
            const sanitizedData = {};
            Object.keys(editingGrn).forEach(key => {
                let value = editingGrn[key] === null ? "" : editingGrn[key];

                if (key === 'date' && value) {
                    value = value.split('T')[0];
                }

                sanitizedData[key] = value;
            });
            setFormData(sanitizedData);
        }
    }, [editingGrn]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validation()) return;
        setLoading(true);

        try {
            if (editingGrn) {
                await grnApi.updateGrn(formData, editingGrn.id);
                alert('GRN updated successfully!');
            } else {
                await grnApi.createGrn(formData);
                alert('GRN registered successfully!');
            }

            handleReset();
            onGrnAdded();

        } catch (error) {
            console.error("Error details:", error);
            const errorMsg = error.response?.data?.sqlMessage || 'Internal server error !!';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({

            supplier_id: '',
            product_id: '',
            date: '',
            qty: '',
            cost_price: '',
            sell_price: '',
            total: ''
        })
        setEditingGrn(null)
        setErrors({})
    }

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <GrNodes className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                    {editingGrn ? 'Update GRN Details' : 'Save New GRN'}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">



                    <ComboBox
                        label="Assign Supplier "
                        name="supplier_id"
                        value={formData.supplier_id}
                        onChange={handleChange}
                        options={supplier}
                        placeholder="Select Supplier"
                        error={errors.supplier_id}
                    />
                    <ComboBox
                        label="Assign product "
                        name="product_id"
                        value={formData.product_id}
                        onChange={handleChange}
                        options={product}
                        placeholder="Select Product"
                        error={errors.product_id}
                    />

                    <TextField
                        label="Date "
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        placeholder="Enter Date "
                        error={errors.date}
                    />

                    <TextField
                        label="Qentity "
                        name="qty"
                        value={formData.qty}
                        onChange={handleChange}
                        placeholder="Enter Quentity "
                        error={errors.qty}
                    />

                    <TextField
                        label="Cost Price "
                        name="cost_price"
                        value={formData.cost_price}
                        onChange={handleChange}
                        placeholder="Enter Cost Price "
                        error={errors.cost_price}
                    />

                    <TextField
                        label="Sell Price"
                        name="sell_price"
                        value={formData.sell_price}
                        onChange={handleChange}
                        placeholder="Enter Sell Price "
                        error={errors.sell_price}
                    />

                    <TextField
                        label="Total"
                        name="total"
                        value={formData.total}
                        onChange={handleChange}
                        placeholder="Enter Total"
                        error={errors.total}
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
                        title={loading ? "Processing..." : (editingGrn ? "Update GRN  " : "Save GRN")}
                        variant={editingGrn ? "warning" : "primary"}
                        icon={editingGrn ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    )
}

export default GRNSave;