import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { loginUser, googleLogin, clearMessages } from "../../redux/features/authSlice";
import { loginSchema, type LoginFormData } from "../../schemas/auth";

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error, successMessage, isAuthenticated } = useAppSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearMessages());
        };
    }, [dispatch]);

    const onSubmit = async (data: LoginFormData) => {
        const result = await dispatch(loginUser(data));
        if (loginUser.fulfilled.match(result)) {
            navigate("/");
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (credentialResponse.credential) {
            const result = await dispatch(googleLogin(credentialResponse.credential));
            if (googleLogin.fulfilled.match(result)) {
                navigate("/");
            }
        }
    };

    const handleGoogleError = () => {
        console.error("Google login failed");
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-base-content">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        Or{" "}
                        <Link
                            to="/register"
                            className="font-medium text-primary hover:text-primary-focus"
                        >
                            create a new account
                        </Link>
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
                                    <span className="label-text">Email address</span>
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.email.message}</span>
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text">Password</span>
                                </label>
                                <input
                                    type="password"
                                    {...register("password")}
                                    className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.password.message}</span>
                                    </label>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="label cursor-pointer">
                                    <input type="checkbox" className="checkbox checkbox-sm" />
                                    <span className="label-text ml-2">Remember me</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary hover:text-primary-focus"
                                >
                                    Forgot your password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>

                        <div className="divider">OR</div>

                        <div className="space-y-3">
                            <div className="w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="outline"
                                    size="large"
                                    width="400"
                                    text="signin_with"
                                    shape="rectangular"
                                />
                            </div>

                            {/* <button className="btn btn-outline w-full">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Continue with Facebook
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
