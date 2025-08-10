import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import App from "../App";
import PageLoader from "../components/PageLoader";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";



// Lazy load components for code splitting
const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const VerifyEmail = lazy(() => import("../pages/Auth/VerifyEmail"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const MarksEntry = lazy(() => import("../pages/MarksEntry/MarksEntry"));
const DocumentSubmission = lazy(() => import("../pages/DocumentSubmission/DocumentSubmission"));
const DocumentSubmissionsList = lazy(() => import("../pages/DocumentSubmission/DocumentSubmissionsList"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const ModuleLeaderDashboard = lazy(() => import("../pages/ModuleLeader/ModuleLeaderDashboard"));
const Courses = lazy(() => import("../pages/Courses/Courses"));
const DeveloperInfo = lazy(() => import("../pages/Developer-Info/DeveloperInfo"));
const DocumentSubmissionHistory = lazy(() => import("../pages/DocumentSubmission/DocumentSubmissionHistory"));
const test= lazy(() => import("../pages/Test/Test"));

// Wrapper component for Suspense - returns a component, not JSX
const withSuspense = (Component: React.ComponentType) => {
    return () => (
        <Suspense fallback={<PageLoader />}>
            <Component />
        </Suspense>
    );
};

export const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
                index: true,
                element: withSuspense(Home)(),
            },
            {
                path: "marks-entry",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher', 'module-leader']}>
                        {withSuspense(MarksEntry)()}
                    </RoleBasedRoute>
                ),
            },
            {
                path: "document-submission",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher', 'module-leader']}>
                        {withSuspense(DocumentSubmission)()}
                    </RoleBasedRoute>
                ),
            },
            {
                path: "document-submissions-list",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher', 'module-leader']}>
                        {withSuspense(DocumentSubmissionsList)()}
                    </RoleBasedRoute>
                ),
            },
            {
                path: "document-submissions-history",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher', 'module-leader']}>
                        {withSuspense(DocumentSubmissionHistory)()}
                    </RoleBasedRoute>
                ),
            },
            {
                path: "courses",
                element: (
                    <ProtectedRoute>
                        {withSuspense(Courses)()}
                    </ProtectedRoute>
                ),
            },
            {
                path: "developer-info",
                element: withSuspense(DeveloperInfo)(),
            },
            {
                path: "login",
                element: withSuspense(Login)(),
            },
            {
                path: "register",
                element: withSuspense(Register)(),
            },
            {
                path: "forgot-password",
                element: withSuspense(ForgotPassword)(),
            },
            {
                path: "reset-password",
                element: withSuspense(ResetPassword)(),
            },
            {
                path: "verify-email",
                element: withSuspense(VerifyEmail)(),
            },
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        {withSuspense(Profile)()}
                    </ProtectedRoute>
                ),
            },
            {
                path: "module-leader",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'module-leader']}>
                        {withSuspense(ModuleLeaderDashboard)()}
                    </RoleBasedRoute>
                ),
            },
            {
                path: "admin",
                element: (
                    <RoleBasedRoute allowedRoles={['admin']}>
                        {withSuspense(AdminDashboard)()}
                    </RoleBasedRoute>
                ),
            },
            {
                path: "test",
                element: (
                    <ProtectedRoute>
                        {withSuspense(test)()}
                    </ProtectedRoute>
                ),
            }
        ],
    },
]);
