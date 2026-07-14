import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteAccountModal from '../components/delete-account-modal/DeleteAccountModal';

const logoutHandler = vi.fn();
const deleteAccount = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ logoutHandler }),
}));

vi.mock('../services/authService', () => ({
    deleteAccount: (...args: unknown[]) => deleteAccount(...args),
}));

const renderModal = (onClose = vi.fn()) => {
    render(<DeleteAccountModal onClose={onClose} />);
    return onClose;
};

describe('DeleteAccountModal', () => {
    beforeEach(() => {
        logoutHandler.mockReset();
        deleteAccount.mockReset();
    });

    it('requires a password before calling the API', async () => {
        renderModal();
        await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
        expect(await screen.findByText(/enter your password/i)).toBeInTheDocument();
        expect(deleteAccount).not.toHaveBeenCalled();
    });

    it('deletes the account and signs out on success', async () => {
        deleteAccount.mockResolvedValueOnce({ message: 'done' });
        logoutHandler.mockResolvedValueOnce(undefined);
        renderModal();

        await userEvent.type(screen.getByLabelText(/^password$/i), 'supersecret1');
        await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));

        await waitFor(() => {
            expect(deleteAccount).toHaveBeenCalledWith('supersecret1');
            expect(logoutHandler).toHaveBeenCalled();
        });
    });

    it('shows the server error and stays open on failure', async () => {
        deleteAccount.mockRejectedValueOnce(new Error('Password is incorrect.'));
        const onClose = renderModal();

        await userEvent.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
        await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));

        expect(await screen.findByText(/password is incorrect/i)).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
        expect(logoutHandler).not.toHaveBeenCalled();
    });
});
