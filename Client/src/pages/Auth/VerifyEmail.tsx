import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { verifyEmail, resendVerificationEmail, clearMessages } from "../../redux/features/authSlice";

const VerifyEmail = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { isLoading, error, successMessage, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (token) {
            dispatch(verifyEmail(token));
        }
    }, [token, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(clearMessages());
        };
    }, [dispatch]);

    const handleResendVerification = async () => {
        await dispatch(resendVerificationEmail());
    };

    if (token && successMessage) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto w-12 h-12 bg-success rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-base-content">
                            Email Verified!
                        </h2>
                        <p className="mt-2 text-sm text-base-content/70">
                            Your email has been successfully verified. You can now access all features.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/"
                                className="btn btn-primary"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (token && error) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto w-12 h-12 bg-error rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-base-content">
                            Verification Failed
                        </h2>
                        <p className="mt-2 text-sm text-base-content/70">
                            {error}
                        </p>
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={handleResendVerification}
                                disabled={isLoading}
                                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                            >
                                {isLoading ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                            <Link
                                to="/login"
                                className="btn btn-ghost w-full"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-base-content">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        {user?.email ? (
                            <>We've sent a verification link to <strong>{user.email}</strong></>
                        ) : (
                            <>Please check your email for a verification link</>
                        )}
                    </p>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body text-center">
                        {successMessage && (
                            <div className="alert alert-success mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-base-content/70">
                                Didn't receive the email? Check your spam folder or:
                            </p>
                            <button
                                onClick={handleResendVerification}
                                disabled={isLoading}
                                className={`btn btn-outline w-full ${isLoading ? 'loading' : ''}`}
                            >
                                {isLoading ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                            <Link
                                to="/"
                                className="btn btn-ghost w-full"
                            >
                                Continue to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
