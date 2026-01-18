import React, { useEffect, useState } from "react";
import { userApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { FaUser } from "react-icons/fa";


const UserRegister = ({ onUserAdded, editingUser, setEditingUser, users = [] }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        country: '',
        disctric: '',
        city: '',
        addree_line1: '',
        address_line2: '',
        postal_code: '',
        mobile_no_1: '',
        mobile_no_2: '',
        email: '',
        password: '',
        status: 1
    });
    const [errors, setErrors] = useState({});
    const validation = () => {

        let newErrors = {};

        if (formData.first_name.length < 3) newErrors.first_name = "First name too short";
        if (formData.last_name.length < 3) newErrors.last_name = "Last name too short";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        const isDuplicate = users.some(u => u.email === formData.email && u.user_id !== editingUser?.user_id);
        if (isDuplicate) {
            newErrors.email = "This email is already in the list";
        }

        if (formData.email.includes('@') === -1) {
            newErrors.email = "Email is not valied "
            return false;
        }

         if (!editingUser || (formData.password && formData.password.length > 0)) {
            if ((formData.password?.length || 0) < 6) {
                newErrors.password = "Password must be at least 6 characters long";
            }
        }

        if (formData.mobile_no_1.length < 10) {
            newErrors.mobile_no_1 = "Mobile number must be at least 10 characters long";
            return false;
        }

        if (formData.mobile_no_2.length < 10) {
           newErrors.mobile_no_2 = "Mobile number must be at least 10 characters long";
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    useEffect(() => {
        if (editingUser) {
            const sanitizedData = {};
            Object.keys(editingUser).forEach(key => {
                sanitizedData[key] = editingUser[key] === null ? "" : editingUser[key];
            });
            setFormData(sanitizedData);
        }
    }, [editingUser]);


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingUser) {
            const sanitizedData = {};
            Object.keys(editingUser).forEach(key => {
                sanitizedData[key] = editingUser[key] === null ? "" : editingUser[key];
            });
            setFormData(sanitizedData);
        }
    }, [editingUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!validation()) return;
        // alert('3')
        try {


            if (editingUser) {
                await userApi.updateUser(formData, editingUser.user_id);
                alert('User updated successfully!');
            } else {

                await userApi.createUser(formData);
                alert('Registration successful!');

            }

            onUserAdded();
            handleReset();
        } catch (error) {
            if (error.response && error.response.status === 400) {
               setErrors({ email: error.response.data.msg });
            } else {
                alert('Action failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            first_name: '',
            last_name: '',
            country: '',
            disctric: '',
            city: '',
            addree_line1: '',
            address_line2: '',
            postal_code: '',
            mobile_no_1: '',
            mobile_no_2: '',
            email: '',
            password: '',
            status: 1
        });
        setEditingUser(null);
    };

    return (
        <div className="relative z-10 w-full max-w-5xl bg-white 
       backdrop-blur-2xl shadow-2xl rounded-[40px] p-12 
       border border-white mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl 
                flex items-center justify-center shadow-lg shadow-emerald-200">

                    <FaUser className="text-white" />
                </div>
                <h2 className={`text-2xl font-bold text-emerald-600`}>
                    {editingUser ? 'Update User Details' : 'Register New User'}
                </h2>

            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">

                    <TextField
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="First name"
                        error={errors.first_name}
                        required />
                    <TextField
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Last name"
                        error={errors.last_name}
                        required />
                    <TextField
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                        error={errors.country}
                        required />

                    <TextField
                        label="District"
                        name="disctric"
                        value={formData.disctric}
                        onChange={handleChange}
                        placeholder="District"
                        error={errors.disctric}
                        required />
                    <TextField
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        error={errors.city}
                        required />
                    <TextField
                        label="Address Line 1"
                        name="addree_line1"
                        value={formData.addree_line1}
                        onChange={handleChange}
                        placeholder="Address line 1"
                        error={errors.addree_line1}
                        required />

                    <TextField
                        label="Address Line 2"
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleChange}
                        placeholder="Address line 2"
                        error={errors.address_line2}
                        required />
                    <TextField
                        label="Postal Code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        placeholder="Postal code"
                        error={errors.postal_code}
                        required />
                    <TextField
                        label="Mobile No 1"
                        name="mobile_no_1"
                        value={formData.mobile_no_1}
                        onChange={handleChange}
                        placeholder="071xxxxxxx"
                        error={errors.mobile_no_1}
                        required />

                    <TextField
                        label="Mobile No 2"
                        name="mobile_no_2"
                        value={formData.mobile_no_2}
                        onChange={handleChange}
                        placeholder="077xxxxxxx"
                        error={errors.mobile_no_2}
                        required />
                    <TextField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                        error={errors.email}
                        required />
                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="********"
                        error={errors.password}
                        required={!editingUser} />

                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <Button
                        title="Cancel"
                        variant="outline"
                        icon="✕"
                        onClick={handleReset}
                        type="button" />
                    <Button
                        title={loading ? "Processing..." : (editingUser ? "Update User" : "Save User")}
                        variant={editingUser ? "warning" : "primary"}
                        icon={editingUser ? "✏️" : "💾"}
                        type="submit"
                    />
                </div>
            </form>
        </div>
    )
}

export default UserRegister;