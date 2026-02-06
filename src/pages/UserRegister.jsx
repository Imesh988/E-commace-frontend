import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { userApi } from "../services/api";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { FaUser } from "react-icons/fa";
import ComboBox from "../components/ComboBox";
import Navbar from "../layout/Navbar";

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
    const [loading, setLoading] = useState(false);

    const countryOptions = [
        { value: "Sri Lanka", label: "Sri Lanka" },
        { value: "Japan", label: "Japan" }
    ];

    const getPrefix = (country) => {
        if (country === "Sri Lanka") return "+94 ";
        if (country === "Japan") return "+81 ";
        return "";
    };

    useEffect(() => {
        if (editingUser) {
            const sanitizedData = {};
            Object.keys(editingUser).forEach(key => {
                sanitizedData[key] = (editingUser[key] === null || editingUser[key] === undefined)
                    ? ""
                    : String(editingUser[key]);
            });
            setFormData({ ...sanitizedData, password: '' });
        }
    }, [editingUser]);

    useEffect(() => {
        if (!editingUser) {
            const prefix = getPrefix(formData.country);
            setFormData(prev => ({
                ...prev,
                mobile_no_1: prefix,
                mobile_no_2: prefix
            }));
        }
    }, [formData.country, editingUser]);

    const validation = () => {
        let newErrors = {};

        const checkEmpty = (val) => String(val || "").trim();

        if (checkEmpty(formData.first_name).length < 3) newErrors.first_name = "First name must be at least 3 characters";
        if (checkEmpty(formData.last_name).length < 3) newErrors.last_name = "Last name must be at least 3 characters";
        if (!formData.country) newErrors.country = "Please select a country";
        if (!checkEmpty(formData.disctric)) newErrors.disctric = "District is required";
        if (!checkEmpty(formData.city)) newErrors.city = "City is required";
        if (!checkEmpty(formData.addree_line1)) newErrors.addree_line1 = "Address Line 1 is required";
        if (!checkEmpty(formData.postal_code)) newErrors.postal_code = "Postal code is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!checkEmpty(formData.email)) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!editingUser) {
            if (!formData.password) newErrors.password = "Password is required";
            else if (formData.password.length < 6) newErrors.password = "Must be at least 6 characters";
        }

           const validateMobileField = (number, fieldName) => {
                const prefix = getPrefix(formData.country);
                if (!formData.country) return;

                const pureNumber = String(number || "").replace(prefix, "").trim();

                if (pureNumber.length === 0) {
                    newErrors[fieldName] = "Mobile number is required";
                } else if (formData.country === "Sri Lanka") {
                    if (pureNumber.length !== 9) {
                        newErrors[fieldName] = "SL mobile must have 9 digits after +94";
                    }
                } else if (formData.country === "Japan") {
                    if (pureNumber.length < 10 || pureNumber.length > 11) {
                        newErrors[fieldName] = "Japan mobile must have 10-11 digits after +81";
                    }
                }
            };

            validateMobileField(formData.mobile_no_1, "mobile_no_1");
            validateMobileField(formData.mobile_no_2, "mobile_no_2");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "mobile_no_1" || name === "mobile_no_2") {
            const prefix = getPrefix(formData.country);
            if (prefix && !value.startsWith(prefix)) {
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validation()) return;

        setLoading(true);
        try {
            if (editingUser) {
                await userApi.updateUser(formData, editingUser.user_id);
                alert('User updated successfully!');
            } else {

                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

                if (userCredential.user) {
                    await userApi.createUser(formData);
                    alert('Registration successful!');
                }


            }
            if (typeof onUserAdded === 'function') {
                onUserAdded();
            }
            handleReset();
        } catch (error) {
            alert(error.code === 'auth/email-already-in-use'
                ? 'This email is already registered in Firebase'
                : error.response?.data?.msg || error.message);
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

          if (typeof setEditingUser === 'function') {
                setEditingUser(null);
            }
       
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-20">
            <Navbar />

            <main className="mt-12 px-6">
                <div className="relative z-10 w-full max-w-6xl bg-white/90 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[40px] p-8 md:p-14 border border-white mx-auto transition-all duration-500">

                    <div className="flex items-center gap-5 mb-12">
                        <div className="w-14 h-14 bg-emerald-500 rounded-[22px] flex items-center justify-center shadow-lg shadow-emerald-200 transform transition-transform hover:rotate-6">
                            <FaUser className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                                {editingUser ? 'Update User Details' : 'Register New User'}
                            </h2>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mt-1">
                                {editingUser ? 'Modify existing member profile' : 'Create a new premium account'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">

                            <TextField
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="e.g. John"
                                error={errors.first_name}
                            />

                            <TextField
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="e.g. Doe"
                                error={errors.last_name}
                            />

                            <ComboBox
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                options={countryOptions}
                                placeholder="Select Country"
                                error={errors.country}
                            />

                            <TextField
                                label="District"
                                name="disctric"
                                value={formData.disctric}
                                onChange={handleChange}
                                placeholder="e.g. Colombo"
                                error={errors.disctric}
                            />

                            <TextField
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g. Maharagama"
                                error={errors.city}
                            />

                            <TextField
                                label="Address Line 1"
                                name="addree_line1"
                                value={formData.addree_line1}
                                onChange={handleChange}
                                placeholder="Street address or P.O. Box"
                                error={errors.addree_line1}
                            />

                            <TextField
                                label="Address Line 2"
                                name="address_line2"
                                value={formData.address_line2}
                                onChange={handleChange}
                                placeholder="Apartment, suite, unit, etc."
                                error={errors.address_line2}
                            />

                            <TextField
                                label="Postal Code"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                placeholder="e.g. 10280"
                                error={errors.postal_code}
                            />

                            <TextField
                                label={`Mobile No 1 (${formData.country === 'Japan' ? 'JP' : 'SL'})`}
                                name="mobile_no_1"
                                value={formData.mobile_no_1}
                                onChange={handleChange}
                                placeholder={formData.country === 'Japan' ? '+81 90...' : '+94 71...'}
                                error={errors.mobile_no_1}
                            />

                            <TextField
                                label={`Mobile No 2 (${formData.country === 'Japan' ? 'JP' : 'SL'})`}
                                name="mobile_no_2"
                                value={formData.mobile_no_2}
                                onChange={handleChange}
                                placeholder={formData.country === 'Japan' ? '+81 80...' : '+94 77...'}
                                error={errors.mobile_no_2}
                            />

                            <TextField
                                label="Email Address"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                error={errors.email}
                            />

                            <TextField
                                label="Account Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                error={errors.password}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-5 pt-8 border-t border-gray-50">
                            <Button
                                title="Cancel"
                                variant="outline"
                                icon="✕"
                                onClick={handleReset}
                                type="button"
                                className="w-full sm:w-auto"
                            />
                            <Button
                                title={loading ? "Processing..." : (editingUser ? "Update Profile" : "Create Account")}
                                variant={editingUser ? "warning" : "primary"}
                                icon={editingUser ? "✏️" : "💾"}
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto shadow-xl"
                            />
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default UserRegister;