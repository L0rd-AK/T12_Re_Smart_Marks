import { createBrowserRouter } from "react-router";
import App from "../App";
import Home from "../pages/Home/Home";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
        children: [
            {
                index: true,
                element: <Home></Home>,
            },
        ],
    },
]);
