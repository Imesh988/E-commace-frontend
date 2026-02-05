import React from 'react';
import { Navigate , Outlet} from 'react-router-dom';

const ProtectedRoute = ({children , allowedRoles}) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if(!token){
        return <Navigate to='/login'/>
    }

    if(!allowedRoles.includes(role)){
        return <Navigate to='/login' replace/>
    }

    return children ? children : <Outlet />;
}

export default ProtectedRoute; 