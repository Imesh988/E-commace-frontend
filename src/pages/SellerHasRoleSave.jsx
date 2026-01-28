import React, { useEffect, useState } from "react";
import { sellerApi, roleApi, sellerHasRoleApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { RiUser5Fill } from "react-icons/ri";
import ComboBox from "../components/ComboBox";


const SellerhasRoleSave = ({ onSellerHasRole, editingSellerHasRole, setEditingSellerHasRole }) => {
    const [formData, setFormData] = useState({
        id: '',
        seller_id: '',
        role_id: '',
    });

    const [sellers, setSellers] = useState([]);
    const [role, setRole] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetachSellerAndRole = async () => {
            try {
                const res = await sellerApi.getAllSeller();
                const data = res.data && res.data.data ? res.data.data : [];
                const options = data.map((item) => ({
                    value: item.seller_id,
                    label: item.seller_name,
                }));
                const resRole = await roleApi.getAllRole();
                const dataRole = resRole.data && resRole.data.data ? resRole.data.data : [];
                const optionsRole = dataRole.map((item) => ({
                    value: item.role_id,
                    label: item.role,
                }));
                
                setSellers(options);
                setRole(optionsRole)

                
            } catch (error) {
                console.log("Error fetching super admins:", error);
            }
        }

        fetachSellerAndRole();
    }, [])

    const validation = () => {

        let newErrors = {};
        if (!formData.id) {
            newErrors.id = "please enter the id"
        }

        if (!formData.role_id) {
            newErrors.role_id = "please select the role"
        }


        if (!formData.seller_id) {
            newErrors.seller_id = "please select the seller"
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;


    }

    useEffect(() => {
        if (editingSellerHasRole) {
            const sanitizedData = {};
            Object.keys(editingSellerHasRole).forEach(key => {
                sanitizedData[key] = editingSellerHasRole[key] === null ? "" : editingSellerHasRole[key];
            });
            setFormData(sanitizedData);
        }
    }, [editingSellerHasRole]);


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
        const payload = {
            ...formData,
            role_id: parseInt(formData.role_id, 10), 
            seller_id: String(formData.seller_id) 
        };

        console.log("Sending Payload:", payload);

        if (editingSellerHasRole) {
            await sellerHasRoleApi.updateSellerhasRole(payload, editingSellerHasRole.id);
            alert('Seller has role updated successfully!');
        } else {
            await sellerHasRoleApi.createSellerHasRole(payload);
            alert('Seller has role registered successfully!');
        }

        handleReset();
        onSellerHasRole();

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
            id: '',
            seller_id: '',
            role_id: '',
        })
        setEditingSellerHasRole(null)
        setErrors({})
    }

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <RiUser5Fill className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">
                    {editingSellerHasRole ? 'Update Seller Has Role Details' : 'Save New Seller Has Role'}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
                   

                    <TextField
                        label="ID"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="Enter ID"
                        error={errors.id}
                         disabled={!!editingSellerHasRole}
                    />
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
                        label="Assign Role "
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        options={role}
                        placeholder="Select Role"
                        error={errors.role_id}
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
                        title={loading ? "Processing..." : (editingSellerHasRole ? "Update Seller Has Role" : "Save Seller Has Role")}
                        variant={editingSellerHasRole ? "warning" : "primary"}
                        icon={editingSellerHasRole ? "✏️" : "💾"}
                        type="submit"
                        disabled={loading}
                    />
                </div>
            </form>
        </div>
    );

}

export default SellerhasRoleSave;