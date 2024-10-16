import {Navigate, Outlet, } from 'react-router-dom'
import { useAuhtStore } from '../stores'

export const ProtectedRoute = () => {
    const isAuth = useAuhtStore((state) => state.isAuth);
    if (isAuth) return <Outlet />

    return <Navigate to='/login'/>
}
