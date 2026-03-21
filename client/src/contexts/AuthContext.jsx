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
        const result = await authService.login(values.identifier, values.password);
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

    const updateAuthState = useCallback((newAuth) => {
        setAuth(newAuth);
        localStorage.setItem('auth', JSON.stringify(newAuth));
    }, []);

    const values = useMemo(() => ({
        loginSubmitHandler,
        registerSubmitHandler,
        logoutHandler,
        updateAuthState,
        username: auth.username,
        email: auth.email,
        userId: auth._id,
        isAuthenticated: !!auth.accessToken,
        profilePicture: auth.profilePicture,
        usernameChangedAt: auth.usernameChangedAt || null,
    }), [auth, loginSubmitHandler, registerSubmitHandler, logoutHandler, updateAuthState]);

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