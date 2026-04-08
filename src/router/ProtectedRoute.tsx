import {Navigate, Outlet, } from 'react-router-dom'
import { useAuthStore } from '../stores'

export const ProtectedRoute = () => {
    const isAuth = useAuthStore((state) => state.isAuth);
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    
    // Esperar a que se rehidrate el estado antes de decidir mostrar login o app
    if (!hasHydrated) return <Outlet />
    
    if (isAuth) return <Outlet />

    return <Navigate to='/login'/>
}
