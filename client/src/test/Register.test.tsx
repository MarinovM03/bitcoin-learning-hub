import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Register from '../components/register/Register';

const registerSubmitHandler = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ registerSubmitHandler }),
}));

vi.mock('../components/page-meta/PageMeta', () => ({
    default: () => null,
}));

const renderRegister = () =>
    render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>,
    );

const fill = async (overrides: Record<string, string> = {}) => {
    const values = {
        username: 'martin',
        email: 'martin@example.com',
        password: 'supersecret1',
        confirmPassword: 'supersecret1',
        ...overrides,
    };
    await userEvent.type(screen.getByLabelText(/username/i), values.username);
    await userEvent.type(screen.getByLabelText(/^email$/i), values.email);
    await userEvent.type(screen.getByLabelText(/^password$/i), values.password);
    await userEvent.type(screen.getByLabelText(/confirm password/i), values.confirmPassword);
    return values;
};

describe('Register form', () => {
    beforeEach(() => {
        registerSubmitHandler.mockReset();
    });

    it('rejects a username with disallowed characters', async () => {
        renderRegister();
        await fill({ username: 'has space' });
        await userEvent.click(screen.getByRole('button', { name: /create account/i }));
        expect(await screen.findByText(/letters and numbers/i)).toBeInTheDocument();
        expect(registerSubmitHandler).not.toHaveBeenCalled();
    });

    it('rejects an invalid email', async () => {
        renderRegister();
        await fill({ email: 'not-an-email' });
        await userEvent.click(screen.getByRole('button', { name: /create account/i }));
        expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
        expect(registerSubmitHandler).not.toHaveBeenCalled();
    });

    it('rejects mismatched password confirmation', async () => {
        renderRegister();
        await fill({ confirmPassword: 'different-pass-1' });
        await userEvent.click(screen.getByRole('button', { name: /create account/i }));
        expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
        expect(registerSubmitHandler).not.toHaveBeenCalled();
    });

    it('submits valid input to registerSubmitHandler', async () => {
        registerSubmitHandler.mockResolvedValueOnce(undefined);
        renderRegister();
        const values = await fill();
        await userEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(registerSubmitHandler).toHaveBeenCalledWith(expect.objectContaining({
                username: values.username,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
            }));
        });
    });

    it('surfaces server errors from the submit handler', async () => {
        registerSubmitHandler.mockRejectedValueOnce(new Error('User already exists!'));
        renderRegister();
        await fill();
        await userEvent.click(screen.getByRole('button', { name: /create account/i }));
        expect(await screen.findByText('User already exists!')).toBeInTheDocument();
    });
});
