import React, { useEffect, useState } from "react";
import { sellerApi, superAdminApi, roleApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { TbUser } from "react-icons/tb";
import ComboBox from "../components/ComboBox";

const SellerSave = ({ onSellerAdded, editingSeller, setEditingSeller }) => {

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = localStorage.getItem('role');

     const generateSellerId = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // අංක 5ක random අංකයක්
    return `SEL${randomDigits}`;
};
  
    const loggedInAdminId = (userRole === 'super_admin')
        ? String(savedUser?.super_admin_id || savedUser?.id || "")
        : '';

    const [formData, setFormData] = useState({
        seller_id: generateSellerId(),
        seller_name: '',
        address: '',
        email: '',
        mobile_no: '',
        status: 1,
        super_admin_id: loggedInAdminId, 
        role_id: ''
    });

    const [superAdmins, setSuperAdmins] = useState([]);
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!editingSeller && loggedInAdminId) {
            setFormData(prev => ({
                ...prev,
                super_admin_id: loggedInAdminId
            }));
        }
    }, [loggedInAdminId, editingSeller]);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const res = await superAdminApi.getAllSuperAdmin();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((item) => ({
                    value: String(item.super_admin_id),
                    label: item.super_admin_name,
                }));
                setSuperAdmins(options);
            } catch (error) {
                console.error("Error fetching super admins:", error);
            }
        };

        const fetchRoles = async () => {
            try {
                const res = await roleApi.getAllRole();
                const data = res.data && res.data.data ? res.data.data : res.data || [];
                const options = data.map((item) => ({
                    value: String(item.role_id),
                    label: item.role,
                }));
                setRoles(options);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        fetchAdmins();
        fetchRoles();
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
        if (!formData.role_id) {
            newErrors.role_id = "Please select a role";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (editingSeller) {
            const sanitizedData = {};
            Object.keys(editingSeller).forEach(key => {
                if (key === 'super_admin_id' || key === 'role_id') {
                    sanitizedData[key] = editingSeller[key] ? String(editingSeller[key]) : "";
                } else {
                    sanitizedData[key] = editingSeller[key] === null ? "" : editingSeller[key];
                }
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
            const serverMsg = error.response?.data?.msg || "Internal server error";
            alert(serverMsg);
        } finally {
            setLoading(false);
        }
    };

   

    const handleReset = () => {
        setFormData({
            seller_id: generateSellerId(),
            seller_name: '',
            address: '',
            email: '',
            mobile_no: '',
            status: 1,
            super_admin_id: loggedInAdminId, 
            role_id: ''
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
                    {editingSeller ? 'Update Seller Or supplier Details' : 'Save New Seller Or Supplier'}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
                    <TextField
                        label="Seller ID"
                        name="seller_id"
                        value={formData.seller_id}
                        onChange={handleChange}
                        disabled={true} 
                        error={errors.seller_id}
                        placeholder="Generating..."
                    />


                    <TextField
                        label="Seller Name"
                        name="seller_name"
                        value={formData.seller_name}
                        onChange={handleChange}
                        error={errors.seller_name}
                        placeholder="Enter full name"
                    />

                    <TextField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        error={errors.address}
                        placeholder="Enter business address"
                    />

                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="example@mail.com"
                    />

                    <TextField
                        label="Mobile No"
                        name="mobile_no"
                        value={formData.mobile_no}
                        onChange={handleChange}
                        error={errors.mobile_no}
                        placeholder="07xxxxxxxx"
                    />
                    <ComboBox
                        label="Assign Super Admin"
                        name="super_admin_id"
                        value={formData.super_admin_id}
                        onChange={handleChange}
                        options={superAdmins}
                        placeholder="Select Admin"
                        error={errors.super_admin_id}
                        disabled={userRole === 'super_admin' && !editingSeller}
                    />

                    <ComboBox
                        label="Role"
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        options={roles}
                        placeholder="Select Role"
                        error={errors.role_id}
                    />
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <Button title="Cancel" variant="outline" icon="✕" onClick={handleReset} type="button" />
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