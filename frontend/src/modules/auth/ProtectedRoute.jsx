import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { canAccess, ACCESS } from './access';
import { ListSkeleton } from '@/shared/ui/Skeleton';

// Wrap routes with <Route element={<ProtectedRoute minAccess="member" />}>.
// Guests are sent to /login, logged-in users who lack the level to /403.
export default function ProtectedRoute({ minAccess = ACCESS.MEMBER }) {
    const { user, loading } = useAuth();
    // Wait for the session check; deciding too early would bounce a signed-in user to /login.
    if (loading) return <ListSkeleton count={2} />;
    if (canAccess(user, minAccess)) return <Outlet />;
    return <Navigate to={user ? '/403' : '/login'} replace />;
}
