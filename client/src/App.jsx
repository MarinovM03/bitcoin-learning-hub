import { Routes, Route, useNavigate } from "react-router";
import { AuthProvider } from './contexts/AuthContext';
import * as authService from "./services/authService";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./components/home/Home";
import Catalog from "./components/catalog/Catalog";
import Details from "./components/details/Details";
import Create from "./components/create/Create";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import AuthGuard from "./components/guards/AuthGuard";
import GuestGuard from "./components/guards/GuestGuard";
import Edit from "./components/edit/Edit";
import Profile from "./components/profile/Profile";
import NotFound from "./components/not-found/NotFound";

function App() {
    return (
        <AuthProvider>
            <Header />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/articles" element={<Catalog /> } />
                <Route path="/articles/:articleId/details" element={<Details />} />

                {/* Only for Logged-in Users */}
                <Route element={<AuthGuard />} >
                    <Route path="/articles/create" element={<Create />} />
                    <Route path="/articles/:articleId/edit" element={<Edit />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Only for Non-Logged-in Users */}
                <Route element={<GuestGuard />} >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />
        </AuthProvider>
    );
}

export default App
