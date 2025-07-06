import { NavLink } from "react-router";

const links = (
    <>
        <li>
            <NavLink to="#">Assign Quiz Marks</NavLink>
        </li>
        <li>
            <NavLink to="#">Assign Midterm Marks</NavLink>
        </li>
        <li>
            <NavLink to="#">Assign Final Marks</NavLink>
        </li>
    </>
);

const Navbar = () => {
    // TODO: Replace with actual authentication state
    const isAuthenticated = false; // This should come from your auth context/store

    return (
        <div className="navbar bg-base-200 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div
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
                            {" "}
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16"
                            />{" "}
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                    >
                        {isAuthenticated && links}
                    </ul>
                </div>
                <NavLink to="/" className="btn btn-ghost text-xl">Portal</NavLink>
            </div>
            <div className="navbar-center hidden lg:flex">
                {isAuthenticated && (
                    <ul className="menu menu-horizontal px-1">{links}</ul>
                )}
            </div>
            <div className="navbar-end">
                {isAuthenticated ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="m-1">
                            <div className="avatar w-7 h-7">
                                <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                                    <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                                </div>
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                        >
                            <li>
                                <a>Sadib</a>
                            </li>
                            <li>
                                <NavLink to="#">Logout</NavLink>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="space-x-2">
                        <NavLink to="/login" className="btn btn-ghost">
                            Login
                        </NavLink>
                        <NavLink to="/register" className="btn btn-primary">
                            Register
                        </NavLink>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
