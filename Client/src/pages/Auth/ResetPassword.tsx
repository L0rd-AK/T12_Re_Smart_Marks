import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "../../redux/hooks";
import { useResetPasswordMutation } from "../../redux/api/authApi";
import { resetPasswordSchema, type ResetPasswordFormData } from "../../schemas/auth";
import toast from "react-hot-toast";

const ResetPasswordRTK = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token");
            navigate("/forgot-password");
        }
    }, [token, navigate]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return;
        
        try {
            const result = await resetPassword({ token, password: data.password }).unwrap();
            toast.success(result.message || "Password reset successfully!");
            setIsSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || "Failed to reset password");
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-base-content">
                            Password Reset Successful
                        </h2>
                        <p className="mt-2 text-sm text-base-content/70">
                            Your password has been successfully reset.
                        </p>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-base-content/70 mb-6">
                                You will be redirected to the login page shortly.
                            </p>
                            <Link to="/login" className="btn btn-primary w-full">
                                Continue to login
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
                        Reset your password
                    </h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        Enter your new password below.
                    </p>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="label">
                                    <span className="label-text">New Password</span>
                                </label>
                                <input
                                    type="password"
                                    {...register("password")}
                                    className={`input input-bordered w-full ${
                                        errors.password ? "input-error" : ""
                                    }`}
                                    placeholder="Enter your new password"
                                />
                                {errors.password && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.password.message}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text">Confirm New Password</span>
                                </label>
                                <input
                                    type="password"
                                    {...register("confirmPassword")}
                                    className={`input input-bordered w-full ${
                                        errors.confirmPassword ? "input-error" : ""
                                    }`}
                                    placeholder="Confirm your new password"
                                />
                                {errors.confirmPassword && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.confirmPassword.message}
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
                                        Resetting password...
                                    </>
                                ) : (
                                    "Reset password"
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

export default ResetPasswordRTK;
