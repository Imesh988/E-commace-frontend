import React, { useEffect, useState } from "react";
import { sellerApi, supplierApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { SlUser } from "react-icons/sl";
import ComboBox from "../components/ComboBox";


const SupplierSave = ({ onSupplierAdded, editingSupplier, setEditingSupplier }) => {
    const [formData, setFormData] = useState({
        seller_id: '',
        supplier_name: '',
        address: '',
        tel_no: '',
        status: 1,
    });

const [sellers, setSellers] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetachSeller = async () => {
            try {
                const res = await sellerApi.getAllSeller();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((item) => ({
                    value: item.seller_id,
                    label: item.seller_name,
                }));
                setSellers(options);
            } catch (error) {
                console.log("Error fetching super admins:", error);
            }
        }

        fetachSeller();
    },[])

     const validation = () => {
        let newErrors = {};

       if(!formData.seller_id){
        newErrors.seller_id = "please enter the seller id"
       }

       if(!formData.supplier_name.length < 3){
            newErrors.supplier_name = "supplier name must be at least 3 characters"
       }

       if(!formData.address){
        newErrors.address = "please enter the address"
       }

       if(!formData.tel_no){
        newErrors.tel_no = "please enter the tel no"
       }

        setErrors(newErrors); 
        return Object.keys(newErrors).length === 0; 
    };

     useEffect(() => {
            if (editingSupplier) {
                const sanitizedData = {};
                Object.keys(editingSupplier).forEach(key => {
                    sanitizedData[key] = editingSupplier[key] === null ? "" : editingSupplier[key];
                });
                setFormData(sanitizedData);
            }
        }, [editingSupplier]);

        const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
            e.preventDefault();
        
            // if (!validation()) return;
            //     setLoading(true);
            
            try {
                if (editingSupplier) {
                    await supplierApi.updateSupplier(formData, editingSupplier.supplier_id);
                    alert('Supplier updated successfully!');
                } else {
                    await supplierApi.createSupplier(formData);
                    alert('Supplier registered successfully!');
                }
        
                handleReset();
                onSupplierAdded();
        
            } catch (error) {
                console.error("Error details:", error);
                
                alert('Internal server error !!');
                
            } finally {
                setLoading(false);
            }
        }

        const handleReset = () => {
            setFormData({
                seller_id: '',
                supplier_name: '',
                address: '',
                tel_no: '',
                status: 1,
            })
            setEditingSupplier(null)
            setErrors({})
        }

        return (
        <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <SlUser className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                    {editingSupplier ? 'Update supplier Details' : 'Save New Supplier'}
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

                    <TextField
                        label="Supplier name"
                        name="supplier_name"
                        value={formData.supplier_name}
                        onChange={handleChange}
                        placeholder="Enter name"
                        error={errors.seller_name}
                    />
                    <TextField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                        error={errors.address}
                    />
                    <TextField
                        label="Telephone No"
                        name="tel_no"
                        value={formData.tel_no}
                        onChange={handleChange}
                        placeholder="07xxxxxxxx"
                        error={errors.tel_no}
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
                        title={loading ? "Processing..." : (editingSupplier ? "Update Supplier" : "Save Supplier")}
                        variant={editingSupplier ? "warning" : "primary"}
                        icon={editingSupplier ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
}

export default SupplierSave