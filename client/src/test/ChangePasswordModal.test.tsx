import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangePasswordModal from '../components/change-password-modal/ChangePasswordModal';

const updateAuthState = vi.fn();
const updateProfile = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ updateAuthState }),
}));

vi.mock('../services/authService', () => ({
    updateProfile: (...args: unknown[]) => updateProfile(...args),
}));

const renderModal = (onClose = vi.fn()) => {
    render(<ChangePasswordModal onClose={onClose} />);
    return onClose;
};

describe('ChangePasswordModal', () => {
    beforeEach(() => {
        updateAuthState.mockReset();
        updateProfile.mockReset();
    });

    it('renders all three password fields', () => {
        renderModal();
        expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('rejects mismatched confirmation without calling the API', async () => {
        renderModal();
        await userEvent.type(screen.getByLabelText(/current password/i), 'oldpassword1');
        await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpassword1');
        await userEvent.type(screen.getByLabelText(/confirm new password/i), 'different1');
        await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

        expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
        expect(updateProfile).not.toHaveBeenCalled();
    });

    it('rejects a new password equal to the current one', async () => {
        renderModal();
        await userEvent.type(screen.getByLabelText(/current password/i), 'samepassword1');
        await userEvent.type(screen.getByLabelText(/^new password$/i), 'samepassword1');
        await userEvent.type(screen.getByLabelText(/confirm new password/i), 'samepassword1');
        await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

        expect(await screen.findByText(/must be different/i)).toBeInTheDocument();
        expect(updateProfile).not.toHaveBeenCalled();
    });

    it('submits, updates auth state, and closes on success', async () => {
        updateProfile.mockResolvedValueOnce({ username: 'martin', accessToken: 'fresh' });
        const onClose = renderModal();

        await userEvent.type(screen.getByLabelText(/current password/i), 'oldpassword1');
        await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpassword1');
        await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpassword1');
        await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

        await waitFor(() => {
            expect(updateProfile).toHaveBeenCalledWith({
                password: 'newpassword1',
                confirmPassword: 'newpassword1',
                currentPassword: 'oldpassword1',
            });
            expect(updateAuthState).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('stays open when a drag starts inside the dialog and ends on the backdrop', async () => {
        const onClose = renderModal();
        const overlay = document.querySelector('.modal-overlay')!;
        const input = screen.getByLabelText(/current password/i);

        fireEvent.mouseDown(input);
        fireEvent.click(overlay);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes when the backdrop itself is pressed and released', async () => {
        const onClose = renderModal();
        const overlay = document.querySelector('.modal-overlay')!;

        fireEvent.mouseDown(overlay);
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('shows the server error and stays open on failure', async () => {
        updateProfile.mockRejectedValueOnce(new Error('Current password is incorrect.'));
        const onClose = renderModal();

        await userEvent.type(screen.getByLabelText(/current password/i), 'wrongpassword');
        await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpassword1');
        await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpassword1');
        await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

        expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });
});
