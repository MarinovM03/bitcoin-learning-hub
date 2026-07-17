import { useState } from 'react';
import type { ComponentPropsWithRef, FocusEvent, KeyboardEvent, ReactNode } from 'react';
import { Eye, EyeOff, TriangleAlert } from 'lucide-react';

interface PasswordFieldProps extends ComponentPropsWithRef<'input'> {
    label: string;
    error?: string;
    labelAction?: ReactNode;
}

export default function PasswordField({ label, id, placeholder, error, labelAction, onBlur, ...inputProps }: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    const detectCapsLock = (e: KeyboardEvent<HTMLInputElement>) => {
        if (typeof e.getModifierState === 'function') {
            setCapsLockOn(e.getModifierState('CapsLock'));
        }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        setCapsLockOn(false);
        onBlur?.(e);
    };

    return (
        <div className="form-group">
            {labelAction ? (
                <div className="label-row">
                    <label htmlFor={id}>{label}</label>
                    {labelAction}
                </div>
            ) : (
                <label htmlFor={id}>{label}</label>
            )}
            <div className="password-input-wrapper">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    placeholder={placeholder}
                    onKeyDown={detectCapsLock}
                    onKeyUp={detectCapsLock}
                    {...inputProps}
                    onBlur={handleBlur}
                />
                <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setVisible(v => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                >
                    {visible
                        ? <EyeOff size={16} strokeWidth={2.25} />
                        : <Eye size={16} strokeWidth={2.25} />}
                </button>
            </div>
            {capsLockOn && (
                <p className="caps-lock-warning" role="status">
                    <TriangleAlert size={12} strokeWidth={2.5} />
                    Caps Lock is on
                </p>
            )}
            {error && <p className="field-error">{error}</p>}
        </div>
    );
}
