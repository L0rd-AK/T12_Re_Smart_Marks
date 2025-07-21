import "./App.css";
import { Toaster } from 'sonner';
import Navbar from "./pages/shared/Navbar";
import Footer from './pages/shared/Footer';
import AuthInitializer from './components/AuthInitializer';
import { Outlet } from "react-router";

function App() {
    return (
        // Wrap the entire app with AuthInitializer to handle authentication state
        <AuthInitializer>
            <div className="">
                <Navbar />
                <Outlet />
                <Footer />
                <Toaster 
                    position="top-right"
                    richColors
                    closeButton
                />
            </div>
        </AuthInitializer>
    );
}

export default App;
