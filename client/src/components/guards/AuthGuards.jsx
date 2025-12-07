import { Navigate, Outlet } from "react-router";

export default function AuthGuard({
    auth,
}) {

    if (!auth.accessToken) {
        return <Navigate to="/login" />
    }

    return <Outlet />;
}