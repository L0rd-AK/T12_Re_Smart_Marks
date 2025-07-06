import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { resetPassword, clearMessages } from "../../redux/features/authSlice";
import { resetPasswordSchema, type ResetPasswordFormData } from "../../schemas/auth";

const ResetPassword = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { isLoading, error, successMessage, isAuthenticated } = useAppSelector((state) => state.auth);

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
            navigate("/forgot-password");
        }
    }, [token, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearMessages());
        };
    }, [dispatch]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return;
        
        const result = await dispatch(resetPassword({ token, password: data.password }));
        if (resetPassword.fulfilled.match(result)) {
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-base-content">
                            Invalid Reset Link
                        </h2>
                        <p className="mt-2 text-sm text-base-content/70">
                            The password reset link is invalid or has expired.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block mt-4 text-primary hover:text-primary-focus"
                        >
                            Request a new reset link
                        </Link>
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
                        {error && (
                            <div className="alert alert-error mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="alert alert-success mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text">New Password</span>
                                </label>
                                <input
                                    type="password"
                                    {...register("password")}
                                    className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter your new password"
                                />
                                {errors.password && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.password.message}</span>
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
                                    className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="Confirm your new password"
                                />
                                {errors.confirmPassword && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
                                    </label>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
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

                        <div className="text-center mt-4">
                            <Link
                                to="/login"
                                className="text-sm text-primary hover:text-primary-focus"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
