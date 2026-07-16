import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Login from '../components/login/Login';

const loginSubmitHandler = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ loginSubmitHandler }),
}));

vi.mock('../components/page-meta/PageMeta', () => ({
    default: () => null,
}));

const renderLogin = () =>
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>,
    );

describe('Login form', () => {
    beforeEach(() => {
        loginSubmitHandler.mockReset();
    });

    it('renders the form fields', () => {
        renderLogin();
        expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('blocks submission when fields are empty', async () => {
        renderLogin();
        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
        expect(loginSubmitHandler).not.toHaveBeenCalled();
        expect(await screen.findByText(/please enter your email or username/i)).toBeInTheDocument();
    });

    it('calls loginSubmitHandler with the submitted values', async () => {
        loginSubmitHandler.mockResolvedValueOnce(undefined);
        renderLogin();

        await userEvent.type(screen.getByLabelText(/email or username/i), 'martin@example.com');
        await userEvent.type(screen.getByLabelText(/^password$/i), 'supersecret1');
        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(loginSubmitHandler).toHaveBeenCalledWith(
                {
                    identifier: 'martin@example.com',
                    password: 'supersecret1',
                },
                undefined,
            );
        });
    });

    it('renders a server error when the submit handler rejects', async () => {
        loginSubmitHandler.mockRejectedValueOnce(new Error('Invalid credentials'));
        renderLogin();

        await userEvent.type(screen.getByLabelText(/email or username/i), 'martin@example.com');
        await userEvent.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });
});
