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
                <Route path="/articles/:articleId/details" element={<Details />} />
                <Route path="/articles/create" element={<Create />} />

                <Route path="/login" element={<Login onLoginSubmit={loginSubmitHandler} />} />
                <Route path="/register" element={<Register onRegisterSubmit={registerSubmitHandler} />} />
            </Routes>

            <Footer />
        </>
    );
}

export default App
