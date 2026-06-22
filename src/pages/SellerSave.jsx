import React, { useEffect, useState } from "react";
import { sellerApi, stockApi, grnApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { AiOutlineStock } from "react-icons/ai";
import ComboBox from "../components/ComboBox";
import clsx from "clsx";


const StockSave = ({ onStockAdded, editingStock, setEditingStock }) => {
    const [formData, setFormData] = useState({
        seller_id: '',
        grn_id: '',
        qty: '',
        status: 1
    });

    const [sellers, setSellers] = useState([]);
    const [grn, setGrn] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // ✅ Current seller auto-fill කිරීම
    useEffect(() => {
        const fetchCurrentSeller = async () => {
            try {
                const userStr = localStorage.getItem('user');
                let userId = null;
                if (userStr) {
                    const user = JSON.parse(userStr);
                    userId = user.user_id || user.id;
                } else {
                    userId = localStorage.getItem('user_id');
                }
                if (userId && !editingStock) {
                    const res = await sellerApi.getSellerByUserId(userId);
                    const seller = res.data?.data;
                    if (seller) {
                        setFormData(prev => ({ ...prev, seller_id: seller.seller_id }));
                    }
                }
            } catch (e) {
                console.error('Error fetching current seller:', e);
            }
        };
        fetchCurrentSeller();
    }, [editingStock]);

    useEffect(() => {
        const fetchSellerAndGrn = async () => {
            try {
                // ✅ Sellers load කරන්න
                const res = await sellerApi.getAllSeller();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((item) => ({
                    value: item.seller_id,
                    label: item.business_name || item.owner_name || `Seller ${item.seller_id}`,
                }));
                
                // ✅ GRN load කරන්න
                const resGrn = await grnApi.getAllGrn();
                const dataGrn = resGrn.data && resGrn.data.data ? resGrn.data.data : [];
                const optionsGrn = dataGrn.map((item) => ({
                    value: item.id,
                    label: `GRN-${item.id}`,
                }));
                
                setSellers(options);
                setGrn(optionsGrn);
            } catch (error) {
                console.log("Error fetching data:", error);
            }
        };
        fetchSellerAndGrn();
    }, []);

    const validation = () => {
        let newErrors = {};
        if (!formData.seller_id) newErrors.seller_id = "please select the seller";
        if (!formData.grn_id) newErrors.grn_id = "please select the grn";
        if (!formData.qty || formData.qty <= 0) newErrors.qty = "Quantity must be greater than 0";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (editingStock) {
            setFormData({
                seller_id: editingStock.seller_id || '',
                grn_id: editingStock.grn_id || '',
                qty: editingStock.qty || '',
                status: editingStock.status || 1
            });
        }
    }, [editingStock]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validation()) return;
        setLoading(true);
        try {
            if (editingStock) {
                await stockApi.updateStock(formData, editingStock.id);
                alert('Stock updated successfully!');
            } else {
                await stockApi.createStock(formData);
                alert('Stock registered successfully!');
            }
            handleReset();
            onStockAdded();
        } catch (error) {
            console.error("Error details:", error);
            const errorMsg = error.response?.data?.sqlMessage || error.response?.data?.msg || 'Internal server error !!';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            seller_id: '',
            grn_id: '',
            qty: '',
            status: 1
        });
        setEditingStock(null);
        setErrors({});
    };

    return (
        <div className={clsx('relative', 'z-10', 'w-full', 'max-w-5xl', 'bg-white', 'backdrop-blur-2xl', 'shadow-2xl', 'rounded-[40px]', 'p-12', 'border', 'border-white', 'mx-auto')}>
            <div className={clsx('flex', 'items-center', 'gap-4', 'mb-12')}>
                <div className={clsx('w-12', 'h-12', 'bg-emerald-500', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'shadow-lg', 'shadow-emerald-200')}>
                    <AiOutlineStock className="text-white" />
                </div>
                <h2 className={clsx('text-2xl', 'font-bold', 'text-emerald-600')}>
                    {editingStock ? 'Update Stock Details' : 'Save New Stock'}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-x-12', 'gap-y-8', 'mb-12')}>
                    <ComboBox
                        label="Assign Seller"
                        name="seller_id"
                        value={formData.seller_id}
                        onChange={handleChange}
                        options={sellers}
                        placeholder="Select Seller"
                        error={errors.seller_id}
                        disabled={editingStock !== null}
                    />
                    <ComboBox
                        label="Assign GRN"
                        name="grn_id"
                        value={formData.grn_id}
                        onChange={handleChange}
                        options={grn}
                        placeholder="Select GRN"
                        error={errors.grn_id}
                        disabled={editingStock !== null}
                    />
                    <TextField
                        label="Quantity"
                        name="qty"
                        type="number"
                        value={formData.qty}
                        onChange={handleChange}
                        placeholder="Enter Quantity"
                        error={errors.qty}
                    />
                </div>

                <div className={clsx('flex', 'justify-end', 'gap-4', 'mt-4')}>
                    <Button
                        title="Cancel"
                        variant="outline"
                        icon="✕"
                        onClick={handleReset}
                        type="button"
                    />
                    <Button
                        title={loading ? "Processing..." : (editingStock ? "Update Stock" : "Save Stock")}
                        variant={editingStock ? "warning" : "primary"}
                        icon={editingStock ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
};

export default StockSave;