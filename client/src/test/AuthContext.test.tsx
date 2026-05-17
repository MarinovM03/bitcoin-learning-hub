import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

vi.mock('../services/authService', () => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    updateProfile: vi.fn(),
    getProfile: vi.fn(),
}));

import * as authService from '../services/authService';

const makeToken = (payload: Record<string, unknown>) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature-placeholder`;
};

const futureToken = () => makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
const pastToken = () => makeToken({ exp: Math.floor(Date.now() / 1000) - 3600 });

const Consumer = () => {
    const { username, isAuthenticated, isAdmin, loginSubmitHandler, logoutHandler } = useAuth();
    return (
        <>
            <span data-testid="username">{username ?? 'anonymous'}</span>
            <span data-testid="isAuth">{String(isAuthenticated)}</span>
            <span data-testid="isAdmin">{String(isAdmin)}</span>
            <button onClick={() => loginSubmitHandler({ identifier: 'a', password: 'b' })}>login</button>
            <button onClick={() => logoutHandler()}>logout</button>
        </>
    );
};

const renderWithProviders = () =>
    render(
        <MemoryRouter>
            <AuthProvider>
                <Consumer />
            </AuthProvider>
        </MemoryRouter>,
    );

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('starts unauthenticated when localStorage is empty', () => {
        renderWithProviders();
        expect(screen.getByTestId('username').textContent).toBe('anonymous');
        expect(screen.getByTestId('isAuth').textContent).toBe('false');
        expect(screen.getByTestId('isAdmin').textContent).toBe('false');
    });

    it('hydrates from a stored token with a future expiry', () => {
        localStorage.setItem('auth', JSON.stringify({
            accessToken: futureToken(),
            username: 'martin',
            role: 'admin',
        }));
        renderWithProviders();
        expect(screen.getByTestId('username').textContent).toBe('martin');
        expect(screen.getByTestId('isAuth').textContent).toBe('true');
        expect(screen.getByTestId('isAdmin').textContent).toBe('true');
    });

    it('clears expired tokens on hydration', () => {
        localStorage.setItem('auth', JSON.stringify({
            accessToken: pastToken(),
            username: 'martin',
        }));
        renderWithProviders();
        expect(screen.getByTestId('isAuth').textContent).toBe('false');
        expect(localStorage.getItem('auth')).toBeNull();
    });

    it('persists user on successful login', async () => {
        vi.mocked(authService.login).mockResolvedValueOnce({
            accessToken: futureToken(),
            _id: 'u1',
            username: 'martin',
            email: 'martin@example.com',
            role: 'user',
            profilePicture: '',
            usernameChangedAt: null,
        });

        renderWithProviders();
        await act(async () => {
            screen.getByText('login').click();
        });

        expect(screen.getByTestId('isAuth').textContent).toBe('true');
        expect(screen.getByTestId('username').textContent).toBe('martin');
        expect(localStorage.getItem('auth')).toContain('martin');
    });

    it('clears state and localStorage on logout', async () => {
        localStorage.setItem('auth', JSON.stringify({
            accessToken: futureToken(),
            username: 'martin',
        }));
        renderWithProviders();
        expect(screen.getByTestId('isAuth').textContent).toBe('true');

        await act(async () => {
            screen.getByText('logout').click();
        });

        expect(screen.getByTestId('isAuth').textContent).toBe('false');
        expect(localStorage.getItem('auth')).toBeNull();
    });

    it('responds to auth:unauthorized events by clearing state', () => {
        localStorage.setItem('auth', JSON.stringify({
            accessToken: futureToken(),
            username: 'martin',
        }));
        renderWithProviders();
        expect(screen.getByTestId('isAuth').textContent).toBe('true');

        act(() => {
            window.dispatchEvent(new Event('auth:unauthorized'));
        });

        expect(screen.getByTestId('isAuth').textContent).toBe('false');
        expect(localStorage.getItem('auth')).toBeNull();
    });
});
