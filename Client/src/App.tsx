import "./App.css";
import Navbar from "./pages/shared/Navbar";
import Footer from './pages/shared/Footer';
import AuthInitializer from './components/AuthInitializer';
import { Outlet } from "react-router";

function App() {
    return (
        <AuthInitializer>
            <div>
                <Navbar/>
                <Outlet/>
                <Footer/>
            </div>
        </AuthInitializer>
    );
}

export default App;
