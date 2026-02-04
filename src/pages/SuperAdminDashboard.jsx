import React from 'react';


export const SuperAdminDashboard = () => {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    }

    return (
          <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome, You are logged in as a <b>Super Admin</b>.</p>
            <button onClick={handleLogout} style={{ padding: '10px', backgroundColor: 'red', color: 'white', border: 'none' }}>Logout</button>
        </div>
    )
}