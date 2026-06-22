import React, { useEffect, useState } from "react";
import { sellerApi, stockApi, grnApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { AiOutlineStock } from "react-icons/ai";
import ComboBox from "../components/ComboBox";

const StockSave = ({ onStockAdded, editingStock, setEditingStock }) => {
    const [formData, setFormData] = useState({
        seller_id: '',
        grn_id: '',
        qty: '',
        status: 1
    });

    // ✅ Seller options - only current seller (or editing stock's seller)
    const [sellers, setSellers] = useState([]);
    const [grn, setGrn] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentSellerFetched, setCurrentSellerFetched] = useState(false);

    // ✅ Load GRNs only (seller list not needed)
    useEffect(() => {
        const fetchGrn = async () => {
            try {
                const resGrn = await grnApi.getAllGrn();
                const dataGrn = resGrn.data && resGrn.data.data ? resGrn.data.data : [];
                const optionsGrn = dataGrn.map((item) => ({
                    value: item.id,
                    label: `GRN-${item.id}`,
                }));
                setGrn(optionsGrn);
            } catch (error) {
                console.log("Error fetching GRNs:", error);
            }
        };
        fetchGrn();
    }, []);

    // ✅ Fetch current seller and set as the only option
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
            if (!userId) return;

            const res = await sellerApi.getSellerByUserId(userId);
            const seller = res.data?.data;
            if (seller) {
                // ✅ Set formData seller_id
                setFormData(prev => ({ ...prev, seller_id: seller.seller_id }));
                // ✅ Set sellers array with only this seller
                setSellers([{
                    value: seller.seller_id,
                    label: seller.business_name || seller.owner_name || `Seller ${seller.seller_id}`
                }]);
                setCurrentSellerFetched(true);
            }
        } catch (e) {
            console.error('Error fetching current seller:', e);
            // Optionally show error toast
        }
    };

    // ✅ When editing, set seller from editingStock and add to options if not present
    useEffect(() => {
        if (editingStock) {
            setFormData({
                seller_id: editingStock.seller_id || '',
                grn_id: editingStock.grn_id || '',
                qty: editingStock.qty || '',
                status: editingStock.status || 1
            });

            // Ensure the editing stock's seller is in the options list
            const sellerExists = sellers.some(s => s.value === editingStock.seller_id);
            if (!sellerExists && editingStock.seller_id) {
                // If not in list, fetch it and add
                sellerApi.getSellerById(editingStock.seller_id)
                    .then(res => {
                        const seller = res.data?.data;
                        if (seller) {
                            setSellers(prev => [...prev, {
                                value: seller.seller_id,
                                label: seller.business_name || seller.owner_name || `Seller ${seller.seller_id}`
                            }]);
                        }
                    })
                    .catch(err => console.error('Error fetching seller for edit:', err));
            }
        } else {
            // New stock - fetch current seller if not already done
            if (!currentSellerFetched) {
                fetchCurrentSeller();
            }
        }
    }, [editingStock, sellers, currentSellerFetched]);

    // ✅ Also run on mount to fetch current seller (for new stock)
    useEffect(() => {
        if (!editingStock && !currentSellerFetched) {
            fetchCurrentSeller();
        }
    }, []); // Only once

    const validation = () => {
        let newErrors = {};
        if (!formData.seller_id) newErrors.seller_id = "please select the seller";
        if (!formData.grn_id) newErrors.grn_id = "please select the grn";
        if (!formData.qty || formData.qty <= 0) newErrors.qty = "Quantity must be greater than 0";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
            const errorMsg = error.response?.data?.sqlMessage || 'Internal server error !!';
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
        // Reset seller options to only current seller (refetch)
        setCurrentSellerFetched(false);
        fetchCurrentSeller();
    };

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <AiOutlineStock className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                    {editingStock ? 'Update Stock Details' : 'Save New Stock'}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
                    {/* ✅ Seller ComboBox – disabled and only shows current seller */}
                    <ComboBox
                        label="Seller"
                        name="seller_id"
                        value={formData.seller_id}
                        onChange={handleChange}
                        options={sellers}
                        placeholder={sellers.length === 0 ? "Loading seller..." : "Select Seller"}
                        error={errors.seller_id}
                        disabled={true}  // ✅ Disable to prevent changing seller
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

                <div className="flex justify-end gap-4 mt-4">
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