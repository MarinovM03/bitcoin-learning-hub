import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import * as authService from '../services/authService';
import type { RegisterData } from '../services/authService';
import type { AuthUser } from '../types';

interface LoginFormValues {
    identifier: string;
    password: string;
}

type AuthState = Partial<AuthUser>;

interface AuthContextValue {
    loginSubmitHandler: (values: LoginFormValues) => Promise<void>;
    registerSubmitHandler: (values: RegisterData) => Promise<void>;
    logoutHandler: () => Promise<void>;
    updateAuthState: (newAuth: AuthUser) => void;
    username: string | undefined;
    email: string | undefined;
    userId: string | undefined;
    isAuthenticated: boolean;
    isAdmin: boolean;
    profilePicture: string | undefined;
    usernameChangedAt: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const navigate = useNavigate();

    const [auth, setAuth] = useState<AuthState>(() => {
        const serializedAuth = localStorage.getItem('auth');
        if (serializedAuth) {
            return JSON.parse(serializedAuth) as AuthState;
        }
        return {};
    });

    const loginSubmitHandler = useCallback(async (values: LoginFormValues) => {
        const result = await authService.login(values.identifier, values.password);
        setAuth(result);
        localStorage.setItem('auth', JSON.stringify(result));
        navigate('/');
    }, [navigate]);

    const registerSubmitHandler = useCallback(async (values: RegisterData) => {
        const result = await authService.register(values);
        setAuth(result);
        localStorage.setItem('auth', JSON.stringify(result));
        navigate('/');
    }, [navigate]);

    const logoutHandler = useCallback(async () => {
        try {
            await authService.logout();
        } catch {
            console.log('Logout failed');
        }
        setAuth({});
        localStorage.removeItem('auth');
        navigate('/');
    }, [navigate]);

    const updateAuthState = useCallback((newAuth: AuthUser) => {
        setAuth(newAuth);
        localStorage.setItem('auth', JSON.stringify(newAuth));
    }, []);

    useEffect(() => {
        const onUnauthorized = () => {
            setAuth({});
            localStorage.removeItem('auth');
        };
        window.addEventListener('auth:unauthorized', onUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
    }, []);

    const values = useMemo<AuthContextValue>(() => ({
        loginSubmitHandler,
        registerSubmitHandler,
        logoutHandler,
        updateAuthState,
        username: auth.username,
        email: auth.email,
        userId: auth._id,
        isAuthenticated: !!auth.accessToken,
        isAdmin: auth.role === 'admin',
        profilePicture: auth.profilePicture,
        usernameChangedAt: auth.usernameChangedAt ?? null,
    }), [auth, loginSubmitHandler, registerSubmitHandler, logoutHandler, updateAuthState]);

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
