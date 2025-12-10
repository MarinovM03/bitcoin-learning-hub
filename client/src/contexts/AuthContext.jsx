import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router";
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [auth, setAuth] = useState(() => {
        const serializedAuth = localStorage.getItem('auth');
        if (serializedAuth) {
            return JSON.parse(serializedAuth);
        }
        return {};
    });

    const loginSubmitHandler = async (values) => {
        const result = await authService.login(values.email, values.password);
        setAuth(result);
        localStorage.setItem('auth', JSON.stringify(result));
        navigate('/');
    };

    const registerSubmitHandler = async (values) => {
        const result = await authService.register(values.email, values.password);
        setAuth(result);
        localStorage.setItem('auth', JSON.stringify(result));
        navigate('/');
    };

    const logoutHandler = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.log('Logout failed');
        }

        setAuth({});
        localStorage.removeItem('auth');
        navigate('/');
    };

    const values = {
        loginSubmitHandler,
        registerSubmitHandler,
        logoutHandler,
        username: auth.username || auth.email,
        email: auth.email,
        userId: auth._id,
        isAuthenticated: !!auth.accessToken,
    };

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};