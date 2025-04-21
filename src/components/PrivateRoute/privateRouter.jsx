import React from 'react';
import{Navigate, Outlet, useLocation} from 'react-router-dom'

const isAuthenticated = () =>{
    return localStorage.getItem('authToken') !== null;
};

const PrivateRoute = () => {
    const location = useLocation();

    if(!isAuthenticated()){
        return <Navigate to='/login' state={{ from: location}} replace />
    }
    return <Outlet/>
};

export default PrivateRoute;