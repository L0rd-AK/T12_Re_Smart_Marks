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
// const MidtermMarks = lazy(() => import("../pages/Midterm-Marks/MidtermMarks"));
const MidtermShortcurt = lazy(() => import("../pages/Midterm-Marks/MidtermShortcurt"));
const FinalMarks = lazy(() => import("../pages/Final-Marks/FinalMarks"));
const FinalMarksShortcut = lazy(() => import("../pages/Final-Marks/FinalMarksShortcut"));
const QuizMarks = lazy(() => import("../pages/Quiz-Marks/QuizMarks"));
const QuizShortcut = lazy(() => import("../pages/Quiz-Marks/QuizShortcurt"));
const AssignmentMarks = lazy(() => import("../pages/Assignment-Marks/AssignmentMarks"));
const AssignmentShortcut = lazy(() => import("../pages/Assignment-Marks/AssignmentShortcut"));
const PresentationMarks = lazy(() => import("../pages/Presentation-Marks/PresentationMarks"));
const PresentationShortcut = lazy(() => import("../pages/Presentation-Marks/PresentationShortcut"));
const StudentMarksSummary = lazy(() => import("../pages/Student-Marks/StudentMarksSummary"));

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
                Component: withSuspense(MidtermShortcurt),
            },
            // {
            //     path: "midterm-shortcut",
            //     Component: withSuspense(MidtermShortcurt),
            // },
            {
                path: "quiz-marks",
                Component: withSuspense(QuizMarks),
            },
            {
                path: "quiz-shortcut",
                Component: withSuspense(QuizShortcut),
            },
            {
                path: "assignment-marks",
                Component: withSuspense(AssignmentMarks),
            },
            {
                path: "assignment-marks/:formatId",
                Component: withSuspense(AssignmentMarks),
            },
            {
                path: "assignment-shortcut",
                Component: withSuspense(AssignmentShortcut),
            },
            {
                path: "presentation-marks",
                Component: withSuspense(PresentationMarks),
            },
            {
                path: "presentation-marks/:formatId",
                Component: withSuspense(PresentationMarks),
            },
            {
                path: "presentation-shortcut",
                Component: withSuspense(PresentationShortcut),
            },
            {
                path: "student-marks-summary",
                Component: withSuspense(StudentMarksSummary),
            },
            {
                path: "final-marks",
                Component: withSuspense(FinalMarks),
            },
            {
                path: "final-shortcut",
                Component: withSuspense(FinalMarksShortcut),
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
