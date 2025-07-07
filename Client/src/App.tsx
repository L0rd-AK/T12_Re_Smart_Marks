import "./App.css";
import Navbar from "./pages/shared/Navbar";
import Footer from './pages/shared/Footer';
import { Outlet } from "react-router";

function App() {
    return (
        <div>
            <Navbar/>
            <Outlet/>
            <Footer/>
        </div>
    );
}

export default App;
