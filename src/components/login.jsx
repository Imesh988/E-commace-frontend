import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { Eye, EyeOff, Mail, Smartphone, Globe, ArrowLeft } from 'lucide-react';
import Navbar from '../layout/Navbar';
import { shippingAddressApi } from "../services/api";


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("1. Firebase User Credential:", userCredential.user);

        if(userCredential.user){
            const response = await axiosInstance.post('/auth/login', {
                email,
                password,
                isFirebaseLogin: true
            });
            console.log("2. Backend Login Response Data:", response.data);

            if (response.data.success) {
                const token = response.data.token;
                const userData = response.data.user;
                
                localStorage.setItem('token', token);
                localStorage.setItem('role', response.data.role);
                localStorage.setItem('user', JSON.stringify(userData));

                console.log("3. Token after localStorage:", localStorage.getItem('token'));
                console.log("4. User data after localStorage:", userData);

                // ✅ මෙතනදි user address එක shipping address එකට copy කරන්න
                if (userData.user_id) {
                    try {
                        console.log("📦 Copying user address to shipping address...");
                        
                        // Prepare address data from user profile
                        const recipientName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
                        const addressLine1 = userData.address_line1 || userData.addree_line1 || '';
                        const city = userData.city || '';
                        const district = userData.disctric || userData.district || '';
                        const postalCode = userData.postal_code || '';
                        const country = userData.country || 'Sri Lanka';
                        const phoneNumber = userData.mobile_no_1 || '';
                        
                        // Check if address has required fields
                        if (addressLine1 && city && district && postalCode && phoneNumber) {
                            // Check existing shipping addresses
                            const existingAddresses = await shippingAddressApi.getShippingAddressesByUserId(userData.user_id);
                            
                            if (existingAddresses.data && existingAddresses.data.length > 0) {
                                // Update existing shipping address
                                const existingAddress = existingAddresses.data[0];
                                await shippingAddressApi.updateShippingAddress(existingAddress.shipping_id, {
                                    recipient_name: recipientName,
                                    address_line_1: addressLine1,
                                    address_line_2: userData.address_line2 || '',
                                    city: city,
                                    district: district,
                                    postal_code: postalCode,
                                    country: country,
                                    phone_number: phoneNumber,
                                    is_default: true
                                });
                                console.log("✅ Shipping address updated");
                            } else {
                                // Create new shipping address
                                await shippingAddressApi.createShippingAddress({
                                    user_id: userData.user_id,
                                    recipient_name: recipientName,
                                    address_line_1: addressLine1,
                                    address_line_2: userData.address_line2 || '',
                                    city: city,
                                    district: district,
                                    postal_code: postalCode,
                                    country: country,
                                    phone_number: phoneNumber,
                                    is_default: true
                                });
                                console.log("✅ Shipping address created");
                            }
                        } else {
                            console.log("⚠️ User address incomplete, skipping copy");
                        }
                        
                    } catch (addressError) {
                        console.log("⚠️ Address copy error:", addressError.message);
                        // Address copy fail වුණත් login දිගටම කරන්න
                    }
                }

                if (response.data.role === 'super_admin') {
                    navigate('/super-admin/dashboard');
                } else {
                    navigate('/checkout');
                }
            }
        }
    } catch (error) {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
        setLoading(false);
    }
};

    const handleForgotPassword = async () => {
        if (!email) {
            alert("Please enter your email in the email box above !! ");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            alert("A password reset link has been sent to your email address !! ");
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
       <>
      
        <div className="relative min-h-screen w-full overflow-hidden font-sans">
             <Navbar />
            <div className="absolute top-0 h-1/2 w-full bg-[#eaf7ed]"></div>
            <div className="absolute bottom-0 h-1/2 w-full bg-[#fef9e6]"></div>

            <button className="absolute left-8 top-8 z-10 p-2 text-gray-600 hover:text-gray-900 transition-colors">
               
            </button>

            <div className="relative flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-[440px] rounded-[32px] bg-white p-10 shadow-2xl shadow-gray-200/50 transition-all">
                    
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold text-[#2d4030] tracking-tight mb-2">Welcome Back</h1>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm font-bold text-red-500 animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    required
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-4 text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder = "********"
                                    required
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-4 text-gray-700 outline-none transition-all focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button
                                onClick={handleForgotPassword}
                                type="button" className="text-[11px] font-bold text-green-600 hover:underline">Forgot Password?</button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-[#fde68a] py-4 text-sm font-black text-yellow-900 shadow-lg shadow-yellow-100 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "AUTHENTICATING..." : "LOGIN"}
                        </button>
                    </form>

                    <div className="mt-10">
                        <div className="relative mb-8 text-center">
                            <div className="absolute top-1/2 w-full border-t border-gray-100"></div>
                            <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Or continue with</span>
                        </div>

                      

                        <p 
                            onClick={() => navigate('/userRegister')}
                        className="mt-10 text-center text-xs font-bold text-gray-400">
                            Don't have an account? <span className="cursor-pointer text-green-600 hover:underline">Sign Up</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
       </>
    );
};

const SocialIcon = ({ icon }) => (
    <button className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 text-gray-400 transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-600">
        {icon}
    </button>
);

export default Login;