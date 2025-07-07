import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "../../redux/hooks";
import { useForgotPasswordMutation } from "../../redux/api/authApi";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../../schemas/auth";
import toast from "react-hot-toast";

const ForgotPasswordRTK = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [emailSent, setEmailSent] = useState(false);
    
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const result = await forgotPassword({ email: data.email }).unwrap();
            toast.success(result.message || "Password reset email sent!");
            setEmailSent(true);
        } catch (error) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || "Failed to send reset email");
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-base-content">
                            Check your email
                        </h2>
                        <p className="mt-2 text-sm text-base-content/70">
                            We've sent a password reset link to your email address.
                        </p>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-base-content/70 mb-6">
                                If you don't see the email, check your spam folder or try again.
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="btn btn-outline w-full"
                                >
                                    Try another email
                                </button>
                                <Link to="/login" className="btn btn-primary w-full">
                                    Back to login
                                </Link>
                            </div>
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
                        Forgot your password?
                    </h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="label">
                                    <span className="label-text">Email address</span>
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`input input-bordered w-full ${
                                        errors.email ? "input-error" : ""
                                    }`}
                                    placeholder="Enter your email address"
                                />
                                {errors.email && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.email.message}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Sending...
                                    </>
                                ) : (
                                    "Send reset link"
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <Link
                                to="/login"
                                className="text-sm text-primary hover:text-primary-focus"
                            >
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordRTK;
