import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminGuard() {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
