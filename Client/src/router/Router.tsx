import { createBrowserRouter } from "react-router";
import App from "../App";
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import MidtermMarks from "../pages/Midterm-Marks/MidtermMarks";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
                index: true,
                element: <Home/>,
            },
            {
                path: "midterm-marks",
                element: <MidtermMarks/>,
            },
            {
                path: "login",
                element: <Login/>,
            },
            {
                path: "register",
                element: <Register/>,
            },
            {
                path: "forgot-password",
                element: <ForgotPassword/>,
            },
            {
                path: "reset-password",
                element: <ResetPassword/>,
            },
            {
                path: "verify-email",
                element: <VerifyEmail/>,
            },
        ],
    },
]);
