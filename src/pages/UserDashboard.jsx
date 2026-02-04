import React from 'react';

export const UserDashboard = () => {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>User Dashboard</h1>
            <p>Welcome, You are logged in as a <b>Regular User</b>.</p>
            <button onClick={handleLogout} style={{ padding: '10px', backgroundColor: 'red', color: 'white', border: 'none' }}>Logout</button>
        </div>
    );
};