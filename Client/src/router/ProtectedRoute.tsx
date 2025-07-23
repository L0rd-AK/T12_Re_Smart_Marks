import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "../redux/hooks";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireEmailVerification?: boolean;
}

const ProtectedRoute = ({ children, requireEmailVerification = false }: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check email verification if required
    if (requireEmailVerification && user && !user.isEmailVerified) {
        return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
