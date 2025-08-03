import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "../redux/hooks";

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
    requireEmailVerification?: boolean;
    fallbackPath?: string;
}

const RoleBasedRoute = ({ 
    children, 
    allowedRoles, 
    requireEmailVerification = false, 
    fallbackPath = "/" 
}: RoleBasedRouteProps) => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user exists
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check email verification if required
    if (requireEmailVerification && !user.isEmailVerified) {
        return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
};

export default RoleBasedRoute;
