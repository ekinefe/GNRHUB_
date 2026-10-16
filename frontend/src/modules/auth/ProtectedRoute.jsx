import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { canAccess, ACCESS } from './access';

// Wrap routes with <Route element={<ProtectedRoute minAccess="member" />}>.
// Guests are sent to /login, logged-in users who lack the level to /403.
export default function ProtectedRoute({ minAccess = ACCESS.MEMBER }) {
    const { user } = useAuth();
    if (canAccess(user, minAccess)) return <Outlet />;
    return <Navigate to={user ? '/403' : '/login'} replace />;
}
