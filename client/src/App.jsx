import { Routes, Route, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import * as authService from "./services/authService";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./components/home/Home";
import Catalog from "./components/catalog/Catalog";
import Details from "./components/details/Details";
import Create from "./components/create/Create";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import AuthGuard from "./components/guards/AuthGuards";
import GuestGuard from "./components/guards/GuestGuard";
import Edit from "./components/edit/Edit";

function App() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState({});

    useEffect(() => {
        const serializedAuth = localStorage.getItem('auth');
        if (serializedAuth) {
            setAuth(JSON.parse(serializedAuth));
        }
    }, []);

    const loginSubmitHandler = async (values) => {
        try {
            const result = await authService.login(values.email, values.password);
            setAuth(result);
            localStorage.setItem('auth', JSON.stringify(result));
            navigate('/');
        } catch (err) {
            console.log("Login failed", err.message);
        }
    };

    const registerSubmitHandler = async (values) => {
        try {
            const result = await authService.register(values.email, values.password);
            setAuth(result);
            localStorage.setItem('auth', JSON.stringify(result));
            navigate('/');
        } catch (err) {
            console.log("Register failed", err.message);
        }
    };

    const logoutHandler = () => {
        setAuth({});
        localStorage.removeItem('auth');
        navigate('/');
    };

    return (
        <>
            <Header auth={auth} onLogout={logoutHandler} />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/articles" element={<Catalog /> } />
                <Route path="/articles/:articleId/details" element={<Details auth={auth} />} />

                {/* Only for Logged-in Users */}
                <Route element={<AuthGuard auth={auth} />} >
                    <Route path="/articles/create" element={<Create />} />
                    <Route path="/articles/:articleId/edit" element={<Edit />} />
                </Route>

                {/* Only for Non-Logged-in Users */}
                <Route element={<GuestGuard auth={auth} />} >
                    <Route path="/login" element={<Login onLoginSubmit={loginSubmitHandler} />} />
                    <Route path="/register" element={<Register onRegisterSubmit={registerSubmitHandler} />} />
                </Route>
            </Routes>

            <Footer />
        </>
    );
}

export default App
