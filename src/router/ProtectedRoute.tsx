import {Navigate, Outlet, } from 'react-router-dom'
import { useAuthStore } from '../stores'

export const ProtectedRoute = () => {
    const { isAuth, hasHydrated } = useAuthStore();
    
    // Mientras se rehidrata, no renderizar nada para evitar acceso no autenticado
    if (!hasHydrated) return null;
    
    // Si está autenticado, mostrar ruta protegida
    if (isAuth) return <Outlet />

    // Si no está autenticado, redirigir a login
    return <Navigate to='/login'/>
}
