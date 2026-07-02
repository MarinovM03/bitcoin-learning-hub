import { useState } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps extends ComponentPropsWithRef<'input'> {
    label: string;
    error?: string;
    labelAction?: ReactNode;
}

export default function PasswordField({ label, id, placeholder, error, labelAction, ...inputProps }: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);

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
                    {...inputProps}
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
            {error && <p className="field-error">{error}</p>}
        </div>
    );
}
