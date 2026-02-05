import React,{useEffect} from 'react';
import axiosInstance from '../api/axiosConfig';

 const UserDashboard = () => {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    useEffect(() => {
    axiosInstance.get('/auth/verify-profile')
        .then(res => console.log(res))
        .catch(err => console.log(err)); 
}, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>User Dashboard</h1>
            <p>Welcome, You are logged in as a <b>Regular User</b>.</p>
            <button onClick={handleLogout} style={{ padding: '10px', backgroundColor: 'red', color: 'white', border: 'none' }}>Logout</button>
        </div>
    );
};

export default UserDashboard;