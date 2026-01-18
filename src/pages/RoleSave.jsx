import React, { useEffect, useState } from "react";
import { roleApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { HiUserGroup } from "react-icons/hi";


const RoleSave = ({ onRoleAdded, editingRole, setEditingRole }) => {
    const [formData, setFormData] = useState({
        role: '',
        description: ''
    })

    const [errors, setErrors] = useState({});

    const validation = () => {
        let newErrors = {};

        if (formData.role.length < 3) {
            newErrors.role = "Role name too short";
        }

        if (formData.description.length < 3) {
            newErrors.description = "Description too short";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;


    }

    // useEffect(() => {
    //     if (editingRole) {
    //         const sanitizedData = {};
    //         Object.keys(editingRole).forEach(key => {
    //             sanitizedData[key] = editingRole[key] === null ? "" : editingRole[key];
    //         });
    //         setFormData(sanitizedData);
    //     }
    // }, [editingRole]);


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingRole) {
            const sanitizedData = {};
            Object.keys(editingRole).forEach(key => {
                sanitizedData[key] = editingRole[key] === null ? "" : editingRole[key];
            });
            setFormData(sanitizedData);
        }
    }, [editingRole]);

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
        if (editingRole) {
            await roleApi.updateRole(formData, editingRole.role_id);
            alert('Role updated successfully!');
        } else {
            await roleApi.createRole(formData);
            alert('Registration successful!');
        }

        handleReset();
        onRoleAdded();

    } catch (error) {
        console.error("Error details:", error);
        
        alert('Internal server error !!');
        
    } finally {
        setLoading(false);
    }
};

    const handleReset = () => {
        setFormData({
            role: '',
            description: ''
        })
        setEditingRole(null);
    }


    return (
        <div className="relative z-10 w-full max-w-5xl bg-white 
       backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 
       border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl 
                flex items-center justify-center shadow-lg shadow-emerald-200">

                    <HiUserGroup className="text-white" />
                </div>
                <h2 className={`text-2xl font-bold text-emerald-600`}>
                    {editingRole ? 'Update Role Details' : 'Register New Role'}
                </h2>

            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">

                    <TextField
                        label="Role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="Role"
                        error={errors.role}
                        required />
                    <TextField
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="description"
                        error={errors.description}
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
                        title={loading ? "Processing..." : (editingRole ? "Update Role" : "Save Role")}
                        variant={editingRole ? "warning" : "primary"}
                        icon={editingRole ? "✏️" : "💾"}
                        type="submit"
                    />
                </div>
            </form>
        </div>
    )

}

export default RoleSave;
