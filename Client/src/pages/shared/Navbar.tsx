import { NavLink, useNavigate } from "react-router";
import { useAppSelector } from "../../redux/hooks";
import { useLogoutMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";

const links = (user?: any) => (
    <>
        <li>
            <NavLink to="/marks-entry">Marks Entry</NavLink>
        </li>
        <li>
            <NavLink to="/document-submission">Document Submission</NavLink>
        </li>
        {/* <li>
            <NavLink to="/document-submissions">My Submissions</NavLink>
        </li> */}
        <li>
            <NavLink to="/courses">Courses</NavLink>
        </li>
        {/* {user?.role === 'module-leader' && ( */}
            <li>
                <NavLink to="/module-leader">Module Leader</NavLink>
            </li>
         {/* )} */}
         {/* {user?.role === 'admin' && ( */}
            <li>
                <NavLink to="/admin">Admin Dashboard</NavLink>
            </li>
         {/* )} */}
    </>
);

const NavbarRTK = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

    // Ensure user object has required properties before rendering user UI
    const isUserDataComplete =
        user && user.firstName && user.lastName && user.email;

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            toast.success("Logged out successfully!");
            navigate("/");
        } catch (error) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || "Logout failed");
            // Still redirect even if logout API fails
            navigate("/");
        }
    };

    return (
        <div className="navbar bg-base-200 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div
                        title="navigation"
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost lg:hidden"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16"
                            />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                    >
                        {links(user)}
                    </ul>
                </div>
                <NavLink to="/" className="btn btn-ghost text-xl">
                    Smart Marks
                </NavLink>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">{links(user)}</ul>
            </div>

            <div className="navbar-end">
                {isAuthenticated && isUserDataComplete ? (
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-circle avatar"
                        >
                            <div className="w-10 rounded-full">
                                {user.avatar ? (
                                    <img
                                        alt="User avatar"
                                        src={user.avatar}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="bg-neutral text-neutral-content rounded-full w-full h-full flex items-center justify-center">
                                        <span className="text-sm font-semibold">
                                            {user.firstName
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}
                                            {user.lastName
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                        >
                            <li className="menu-title">
                                <span>
                                    {user.firstName || "User"}{" "}
                                    {user.lastName || ""}
                                    {!user.isEmailVerified && (
                                        <div className="badge badge-warning badge-xs ml-1">
                                            Unverified
                                        </div>
                                    )}
                                </span>
                            </li>
                            <li>
                                <NavLink
                                    to="/profile"
                                    className="justify-between"
                                >
                                    Profile
                                    <span className="badge">New</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/settings">Settings</NavLink>
                            </li>
                            {!user.isEmailVerified && (
                                <li>
                                    <NavLink
                                        to="/verify-email"
                                        className="text-warning"
                                    >
                                        Verify Email
                                    </NavLink>
                                </li>
                            )}
                            <li>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="text-error"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Logging out...
                                        </>
                                    ) : (
                                        "Logout"
                                    )}
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <NavLink to="/login" className="btn btn-ghost btn-sm">
                            Login
                        </NavLink>
                        <NavLink
                            to="/register"
                            className="btn btn-primary btn-sm"
                        >
                            Register
                        </NavLink>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NavbarRTK;
