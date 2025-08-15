import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { useAppSelector } from "../../redux/hooks";
import { useLoginMutation, useGoogleLoginMutation } from "../../redux/api/authApi";
import { loginSchema, type LoginFormData } from "../../schemas/auth";
import toast from "react-hot-toast";

const LoginRTK = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();

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

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data).unwrap();
            toast.success("Login successful!");
            
            // Give a moment for the state to update
            setTimeout(() => {
                navigate("/");
            }, 100);
        } catch (error) {
            console.error('Login error:', error);
            const err = error as {
                data?: { message?: string };
                status?: number;
                error?: string;
            };

            // Always prioritize the server message if available
            if (err?.data?.message) {
                toast.error(err.data.message);
            } else if (err.status === 429) {
                toast.error("Too many login attempts. Please try again later.");
            } else if (err.status === 401) {
                toast.error("Invalid email or password.");
            } else if (err.status === 403) {
                toast.error("Account is disabled or requires verification.");
            } else if (err.status === 500) {
                toast.error("Server error. Please try again later.");
            } else {
                // Fallback to generic message
                toast.error(err?.error || "Login failed. Please try again.");
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (credentialResponse.credential) {
            try {
                await googleLogin({ credential: credentialResponse.credential }).unwrap();
                toast.success("Google login successful!");
                
                // Give a moment for the state to update
                setTimeout(() => {
                    navigate("/");
                }, 100);
            } catch (error) {
                console.error('Google login error:', error);
                const err = error as {
                    data?: { message?: string };
                    status?: number;
                    error?: string;
                };

                // Always prioritize the server message if available
                if (err?.data?.message) {
                    toast.error(err.data.message);
                } else if (err.status === 429) {
                    toast.error("Too many login attempts. Please try again later.");
                } else if (err.status === 401) {
                    toast.error("Google authentication failed. Please try again.");
                } else if (err.status === 500) {
                    toast.error("Server error. Please try again later.");
                } else {
                    toast.error(err?.error || "Google login failed. Please try again.");
                }
            }
        }
    };

    const handleGoogleError = () => {
        toast.error("Google login failed");
    };

    const isLoading = isLoginLoading || isGoogleLoading;

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
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text">Email address</span>
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`input input-bordered w-full ${errors.email ? "input-error" : ""
                                        }`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.email.message}
                                        </span>
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
                                    className={`input input-bordered w-full ${errors.password ? "input-error" : ""
                                        }`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.password.message}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 text-sm text-base-content">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link
                                        to="/forgot-password"
                                        className="font-medium text-primary hover:text-primary-focus"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full"
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

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                width="400"
                                text="signup_with"
                                shape="rectangular"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginRTK;
