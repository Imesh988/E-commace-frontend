import React , {useState} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";

const Login = () => {
    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');
    const navigate = useNavigate();
    const [error , setError] = useState('');


    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axiosInstance.post('/auth/login', {
                email,
                password
            });
                
                
            alert('1');
            console.log(response.data);
            if(response.data.success){
                alert('2');
               localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                if(response.data.role === 'super_admin'){
                    navigate('/super-admin/dashboard');
                }else {
                    navigate('/user/dashboard');
                }
            }
        } catch (error) {
              setError(error.response?.data?.message || 'Login failed. Please try again.');
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email / Username:</label>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>Login</button>
            </form>
        </div>
    )
}

export default Login;