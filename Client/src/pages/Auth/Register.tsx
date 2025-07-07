import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { useAppSelector } from "../../redux/hooks";
import { useRegisterMutation, useGoogleLoginMutation } from "../../redux/api/authApi";
import { registerSchema, type RegisterFormData } from "../../schemas/auth";
import toast from "react-hot-toast";

const RegisterRTK = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    
    const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();

    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await register(data).unwrap();
            toast.success("Account created successfully!");
            navigate("/");
        } catch (error) {
            const err = error as { data?: { message?: string; errors?: Record<string, string> } };
            if (err?.data?.errors) {
                // Handle validation errors
                Object.values(err.data.errors).forEach(message => {
                    toast.error(message);
                });
            } else {
                toast.error(err?.data?.message || "Registration failed");
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (credentialResponse.credential) {
            try {
                await googleLogin({ credential: credentialResponse.credential }).unwrap();
                toast.success("Google registration successful!");
                navigate("/");
            } catch (error) {
                const err = error as { data?: { message?: string } };
                toast.error(err?.data?.message || "Google registration failed");
            }
        }
    };

    const handleGoogleError = () => {
        toast.error("Google registration failed");
    };

    const isLoading = isRegisterLoading || isGoogleLoading;

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-base-content">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        Or{" "}
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:text-primary-focus"
                        >
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text">First Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...registerField("firstName")}
                                        className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
                                        placeholder="First name"
                                    />
                                    {errors.firstName && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">{errors.firstName.message}</span>
                                        </label>
                                    )}
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text">Last Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...registerField("lastName")}
                                        className={`input input-bordered w-full ${errors.lastName ? 'input-error' : ''}`}
                                        placeholder="Last name"
                                    />
                                    {errors.lastName && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">{errors.lastName.message}</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text">Email address</span>
                                </label>
                                <input
                                    type="email"
                                    {...registerField("email")}
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
                                    {...registerField("password")}
                                    className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.password.message}</span>
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text">Confirm Password</span>
                                </label>
                                <input
                                    type="password"
                                    {...registerField("confirmPassword")}
                                    className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="Confirm your password"
                                />
                                {errors.confirmPassword && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer justify-start">
                                    <input type="checkbox" required className="checkbox checkbox-sm" />
                                    <span className="label-text ml-2">
                                        I agree to the{" "}
                                        <Link to="/terms" className="text-primary hover:text-primary-focus">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link to="/privacy" className="text-primary hover:text-primary-focus">
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full"
                            >
                                {isRegisterLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Creating account...
                                    </>
                                ) : (
                                    "Create account"
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

export default RegisterRTK;
