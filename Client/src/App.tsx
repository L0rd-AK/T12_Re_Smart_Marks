import "./App.css";
import Navbar from "./pages/shared/Navbar";
import Footer from './pages/shared/Footer';
import { Outlet } from "react-router";

function App() {
    return (
        <div>
            <Navbar></Navbar>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
}

export default App;
