import { createContext, useState, useContext, useMemo, useCallback } from "react";
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

    const loginSubmitHandler = useCallback(async (values) => {
        const result = await authService.login(values.email, values.password);
        setAuth(result);
        localStorage.setItem('auth', JSON.stringify(result));
        navigate('/');
    }, [navigate]);

    const registerSubmitHandler = useCallback(async (values) => {
        const result = await authService.register(values);
        setAuth(result);
        localStorage.setItem('auth', JSON.stringify(result));
        navigate('/');
    }, [navigate]);

    const logoutHandler = useCallback(async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.log('Logout failed');
        }

        setAuth({});
        localStorage.removeItem('auth');
        navigate('/');
    }, [navigate]);

    const values = useMemo(() => ({
        loginSubmitHandler,
        registerSubmitHandler,
        logoutHandler,
        username: auth.username || auth.email,
        email: auth.email,
        userId: auth._id,
        isAuthenticated: !!auth.accessToken,
        profilePicture: auth.profilePicture,
        setAuth,
    }), [auth, loginSubmitHandler, registerSubmitHandler, logoutHandler]);

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