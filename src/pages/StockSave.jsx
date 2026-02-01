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


    const [sellers, setSellers] = useState([]);
    const [grn, setGrn] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetachSellerAndGrn = async () => {
            try {
                const res = await sellerApi.getAllSeller();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((item) => ({
                    value: item.seller_id,
                    label: item.seller_name,
                }));
                const resGrn = await grnApi.getAllGrn();
                const dataGrn = resGrn.data && resGrn.data.data ? resGrn.data.data : [];
                const optionsGrn = dataGrn.map((item) => ({
                    value: item.id,
                    label: item.id,
                }));
                setSellers(options);
                setGrn(optionsGrn)

                console.log(dataGrn);
                

            } catch (error) {
                console.log("Error fetching super admins:", error);
            }
        }

        fetachSellerAndGrn();
    }, [])


    const validation = () => {
        let newErrors = {};

        if (!formData.seller_id) {
            newErrors.seller_id = "please select the seller"
        }

        if (!formData.grn_id) {
            newErrors.grn_id = "please select the grn"
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    useEffect(() => {
        if (editingStock) {
            const sanitizedData = {};
            Object.keys(editingStock).forEach(key => {
                sanitizedData[key] = editingStock[key] === null ? "" : editingStock[key];
            });
            setFormData(sanitizedData);
        }
    }, [editingStock]);

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
            // const payload = {
            //     ...formData,
            //     role_id: parseInt(formData.role_id, 10),
            //     seller_id: String(formData.seller_id)
            // };

            // console.log("Sending Payload:", payload);

            if (setEditingStock) {
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
        })
        setEditingStock(null)
        setErrors({})
    }

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
                   

                 
                     <ComboBox
                        label="Assign Seller "
                        name="seller_id"
                        value={formData.seller_id}
                        onChange={handleChange}
                        options={sellers}
                        placeholder="Select Seller"
                        error={errors.seller_id}
                    />
                     <ComboBox
                        label="Assign Grn "
                        name="grn_id"
                        value={formData.grn_id}
                        onChange={handleChange}
                        options={grn}
                        placeholder="Select Grn"
                        error={errors.grn_id}
                    />

                      <TextField
                        label="Qentity "
                        name="qty"
                        value={formData.qty}
                        onChange={handleChange}
                        placeholder="Enter Quentity "
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
                        title={loading ? "Processing..." : (editingStock ? "Update Stock  " : "Save Stock")}
                        variant={editingStock ? "warning" : "primary"}
                        icon={editingStock ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    )

}


export default StockSave;