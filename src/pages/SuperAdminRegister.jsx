import React , {useState , useEffect} from "react";
import { superAdminApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { ImUserTie } from "react-icons/im";

const SuperAdminRegister = ({onSuperAdminAdded, editingSuperAdmin, setEditingSuperAdmin, superAdmins = []}) => {
    const [formData , setFormData] = useState({
        user_name: '',
        password: '',
        status: 1,
        super_admin_name: '',
        email: '',
        
    })

    const [errors , setErrors] = useState({})

    const validation = () => {
        
        let newErrors = {};

        if (formData.user_name.length < 3) {
            newErrors.user_name = "User name too short";
        }

       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

         if (!editingSuperAdmin || (formData.password && formData.password.length > 0)) {
            if ((formData.password?.length || 0) < 6) {
                newErrors.password = "Password must be at least 6 characters long";
            }
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

     useEffect(() => {
            if (editingSuperAdmin) {
                const sanitizedData = {};
                Object.keys(editingSuperAdmin).forEach(key => {
                    sanitizedData[key] = editingSuperAdmin[key] === null ? "" : editingSuperAdmin[key];
                });
                setFormData(sanitizedData);
            }
        }, [editingSuperAdmin]);


        const [loading , setLoading] = useState(false);


         const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!validation()) return;
        setLoading(true);
    
        try {
            if (editingSuperAdmin) {
                await superAdminApi.updateSuperAdmin(formData, editingSuperAdmin.super_admin_id);
                alert('Super Admin updated successfully!');
            } else {
                await superAdminApi.createSuperAdmin(formData);
                alert('Super Admin registered successfully!');
            }
    
            handleReset();
            onSuperAdminAdded();
    
        } catch (error) {
            console.error("Error details:", error);
            
            alert('Internal server error !!');
            
        } finally {
            setLoading(false);
        }
    }

    const handleReset = () => {
        setFormData({
            user_name: '',
            password: '',
            status: 1,
            super_admin_name: '',
            email: '',
        });

        setEditingSuperAdmin(null);
    }

     return (
        <div className="relative z-10 w-full max-w-5xl bg-white 
       backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 
       border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl 
                flex items-center justify-center shadow-lg shadow-emerald-200">

                    <ImUserTie className="text-white" />
                </div>
                <h2 className={`text-2xl font-bold text-emerald-600`}>
                    {editingSuperAdmin ? 'Update Super Admin Details' : 'Register New Super Admin'}
                </h2>

            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">

                    <TextField
                        label="User Name"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                        placeholder="User name"
                        error={errors.user_name}
                        required />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="************"
                        error={errors.password}
                        required={!editingSuperAdmin} />
                    <TextField
                        label="Super admin name"
                        name="super_admin_name"
                        value={formData.super_admin_name}
                        onChange={handleChange}
                        placeholder="Super admin name"
                        error={errors.super_admin_name}
                        required />

                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        error={errors.email}
                        required />
                   

                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <Button
                        title="Cancel"
                        variant="outline"
                        icon="✕"
                        onClick={handleReset}
                        type="button" />
                    <Button
                        title={loading ? "Processing..." : (editingSuperAdmin ? "Update Super Admin" : "Save Super Admin")}
                        variant={editingSuperAdmin ? "warning" : "primary"}
                        icon={editingSuperAdmin ? "✏️" : "💾"}
                        type="submit"
                    />
                </div>
            </form>
        </div>
    )

}

export default SuperAdminRegister;