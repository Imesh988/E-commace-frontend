import React, { useEffect, useState } from "react";
import { sellerApi, superAdminApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { TbUser } from "react-icons/tb";
import ComboBox from "../components/ComboBox";

const SellerSave = ({ onSellerAdded, editingSeller, setEditingSeller }) => {
    const [formData, setFormData] = useState({
        seller_id: '',
        seller_name: '',
        address: '',
        email: '',
        mobile_no: '',
        status: 1,
        super_admin_id: '',
    });

    const [superAdmins, setSuperAdmins] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const res = await superAdminApi.getAllSuperAdmin();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((item) => ({
                    value: item.super_admin_id,
                    label: item.super_admin_name,
                }));
                setSuperAdmins(options);
            } catch (error) {
                console.error("Error fetching super admins:", error);
            }
        };
        fetchAdmins();
    }, []);

    const validation = () => {
        let newErrors = {};

        if (!editingSeller && (!formData.seller_id || formData.seller_id.trim() === "")) {
            newErrors.seller_id = "Seller ID is required";
        }

        if (!formData.seller_name || formData.seller_name.trim().length < 3) {
            newErrors.seller_name = "Seller name must be at least 3 characters";
        }

        if (!formData.address || formData.address.trim() === "") {
            newErrors.address = "Address is required";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.mobile_no || formData.mobile_no.length < 10) {
            newErrors.mobile_no = "Mobile number must be at least 10 digits";
        }

        if (!formData.super_admin_id) {
            newErrors.super_admin_id = "Please select a super admin";
        }

        setErrors(newErrors); 
        return Object.keys(newErrors).length === 0; 
    };

    useEffect(() => {
        if (editingSeller) {
            const sanitizedData = {};
            Object.keys(editingSeller).forEach(key => {
                sanitizedData[key] = editingSeller[key] === null ? "" : editingSeller[key];
            });
            setFormData(sanitizedData);
        }
    }, [editingSeller]);

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
            if (editingSeller) {
                await sellerApi.updateSeller(formData, editingSeller.seller_id);
                alert('Seller updated successfully!');
            } else {
                await sellerApi.createSeller(formData);
                alert('Seller saved successfully!');
            }

            handleReset();
            onSellerAdded();
        } catch (error) {
            console.error("Error details:", error);

            const serverMsg = error.response?.data?.msg || "";

            if (serverMsg.includes("Seller ID")) {
                setErrors(prev => ({ ...prev, seller_id: serverMsg }));
            } 
            else if (serverMsg.includes("Email")) {
                setErrors(prev => ({ ...prev, email: serverMsg }));
            } 
            else {
                alert(serverMsg || 'Internal server error !!');
            }

        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            seller_id: '',
            seller_name: '',
            address: '',
            email: '',
            mobile_no: '',
            status: 1,
            super_admin_id: ''
        });
        setEditingSeller(null);
        setErrors({});
    };

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <TbUser className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                    {editingSeller ? 'Update Seller Details' : 'Save New Seller'}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
                    <TextField
                        label="Seller ID"
                        name="seller_id"
                        value={formData.seller_id}
                        onChange={handleChange}
                        placeholder="Ex: SEL001"
                        error={errors.seller_id}
                        disabled={!!editingSeller}
                    />
                    <TextField
                        label="Seller Name"
                        name="seller_name"
                        value={formData.seller_name}
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
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                        error={errors.email}
                    />
                    <TextField
                        label="Mobile No"
                        name="mobile_no"
                        value={formData.mobile_no}
                        onChange={handleChange}
                        placeholder="07xxxxxxxx"
                        error={errors.mobile_no}
                    />
                    <ComboBox
                        label="Assign Super Admin"
                        name="super_admin_id"
                        value={formData.super_admin_id}
                        onChange={handleChange}
                        options={superAdmins}
                        placeholder="Select Admin"
                        error={errors.super_admin_id}
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
                        title={loading ? "Processing..." : (editingSeller ? "Update Seller" : "Save Seller")}
                        variant={editingSeller ? "warning" : "primary"}
                        icon={editingSeller ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );
};

export default SellerSave;