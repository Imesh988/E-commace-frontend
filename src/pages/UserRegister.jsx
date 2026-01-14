import React, { useState } from "react";
import { userApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";

const UserRegister = () => {
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

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        alert('3')
        try {
            alert('1')
            await userApi.createUser(formData);
            alert('Registration successful!');
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
            alert('2')
        } catch (error) {
            console.log(error);

            alert('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden p-6">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[120px] opacity-60"></div>

            <div className="relative z-10 w-full max-w-5xl bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[40px] p-12 border border-white/40">

                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-600">Register New User</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">

                        <TextField
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="First name"
                            required />
                        <TextField
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Last name"
                            required />
                        <TextField
                            label="Country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Country"
                            required />

                        <TextField
                            label="District"
                            name="disctric"
                            value={formData.disctric}
                            onChange={handleChange}
                            placeholder="District"
                            required />
                        <TextField
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            required />
                        <TextField
                            label="Address Line 1"
                            name="addree_line1"
                            value={formData.addree_line1}
                            onChange={handleChange}
                            placeholder="Address line 1"
                            required />

                        <TextField
                            label="Address Line 2"
                            name="address_line2"
                            value={formData.address_line2}
                            onChange={handleChange}
                            placeholder="Address line 2" />
                        <TextField
                            label="Postal Code"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            placeholder="Postal code"
                            required />
                        <TextField
                            label="Mobile No 1"
                            name="mobile_no_1"
                            value={formData.mobile_no_1}
                            onChange={handleChange}
                            placeholder="071xxxxxxx"
                            required />

                        <TextField
                            label="Mobile No 2"
                            name="mobile_no_2"
                            value={formData.mobile_no_2}
                            onChange={handleChange}
                            placeholder="077xxxxxxx" />
                        <TextField
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@mail.com"
                            required />
                        <TextField
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="********"
                            required />

                    </div>

                    <div className="flex justify-end gap-4 mt-4">
                        <Button
                            title="Cancel"
                            variant="outline"
                            icon="✕" />
                        <Button
                            title={loading ? "Saving..." : "Save User"}
                            variant="primary"
                            icon="💾" />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UserRegister;