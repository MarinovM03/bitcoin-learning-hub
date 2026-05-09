import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({ label, id, placeholder, error, labelAction, ...inputProps }) {
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
