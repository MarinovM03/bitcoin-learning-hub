import { Navigate, Outlet } from "react-router";

export default function GuestGuard({
    auth,
}) {

    if (auth.accessToken) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
}