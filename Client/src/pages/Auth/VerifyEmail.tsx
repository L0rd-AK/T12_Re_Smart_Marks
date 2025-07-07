import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import { useAppSelector } from "../../redux/hooks";
import { useVerifyEmailMutation, useResendVerificationEmailMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";

const VerifyEmailRTK = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { user } = useAppSelector((state) => state.auth);
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
    
    const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
    const [resendVerificationEmail, { isLoading: isResending }] = useResendVerificationEmailMutation();

    const handleVerifyEmail = useCallback(async (verificationToken: string) => {
        try {
            const result = await verifyEmail({ token: verificationToken }).unwrap();
            toast.success(result.message || "Email verified successfully!");
            setVerificationStatus('success');
        } catch (error) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || "Email verification failed");
            setVerificationStatus('error');
        }
    }, [verifyEmail]);

    useEffect(() => {
        if (token) {
            handleVerifyEmail(token);
        } else {
            setVerificationStatus('no-token');
        }
    }, [token, handleVerifyEmail]);

    const handleResendVerification = async () => {
        try {
            const result = await resendVerificationEmail().unwrap();
            toast.success(result.message || "Verification email sent!");
        } catch (error) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || "Failed to send verification email");
        }
    };

    if (verificationStatus === 'loading' || isVerifying) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-base-content">
                            Verifying Email...
                        </h2>
                        <p className="mt-2 text-sm text-base-content/70">
                            Please wait while we verify your email address.
                        </p>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body text-center">
                            <div className="mb-4">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                            <p className="text-base-content/70">
                                Verifying your email address...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (verificationStatus === 'success') {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-base-content">
                            Email Verified!
                        </h2>
                        <p className="mt-2 text-sm text-base-content/70">
                            Your email has been successfully verified. You can now access all features.
                        </p>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body text-center">
                            <div className="space-y-4">
                                <Link
                                    to="/"
                                    className="btn btn-primary w-full"
                                >
                                    Go to Dashboard
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn btn-outline w-full"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (verificationStatus === 'error') {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-base-content">
                            Verification Failed
                        </h2>
                        <p className="mt-2 text-sm text-base-content/70">
                            The verification link is invalid or has expired.
                        </p>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="space-y-4">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                    className="btn btn-primary w-full"
                                >
                                    {isResending ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        "Resend Verification Email"
                                    )}
                                </button>
                                <Link
                                    to="/login"
                                    className="btn btn-outline w-full"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No token case
    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-base-content">
                        Email Verification
                    </h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        {user?.isEmailVerified 
                            ? "Your email is already verified!" 
                            : "Please check your email for the verification link."
                        }
                    </p>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        {user?.isEmailVerified ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-base-content/70">
                                    Your email address is already verified.
                                </p>
                                <Link to="/" className="btn btn-primary w-full">
                                    Go to Dashboard
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto bg-warning/20 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-base-content/70 mb-4">
                                        We've sent a verification email to your address. Please check your inbox and click the verification link.
                                    </p>
                                </div>
                                <button
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                    className="btn btn-primary w-full"
                                >
                                    {isResending ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        "Resend Verification Email"
                                    )}
                                </button>
                                <Link
                                    to="/login"
                                    className="btn btn-outline w-full"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailRTK;
