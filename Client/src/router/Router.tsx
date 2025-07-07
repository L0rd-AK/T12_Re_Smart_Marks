import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import App from "../App";
import PageLoader from "../components/PageLoader";

// Lazy load components for code splitting
const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const VerifyEmail = lazy(() => import("../pages/Auth/VerifyEmail"));
const MidtermMarks = lazy(() => import("../pages/Midterm-Marks/MidtermMarks"));
import MidtermShortcurt from "../pages/Midterm-Marks/MidtermShortcurt";
  
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
                Component: withSuspense(Home),
            },
            {
                path: "midterm-marks",
                Component: withSuspense(MidtermMarks),
            },
            {
                path: "midterm-shortcut",
                element: withSuspense(MidtermShortcurt),
            },
            {
                path: "login",
                Component: withSuspense(Login),
            },
            {
                path: "register",
                Component: withSuspense(Register),
            },
            {
                path: "forgot-password",
                Component: withSuspense(ForgotPassword),
            },
            {
                path: "reset-password",
                Component: withSuspense(ResetPassword),
            },
            {
                path: "verify-email",
                Component: withSuspense(VerifyEmail),
            },
        ],
    },
]);
