import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";

export default function Register() {
    const { registerSubmitHandler } = useAuth();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formValues, setFormValues] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const changeHandler = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (formValues.username.trim().length < 3) {
            setError("Username must be at least 3 characters long!");
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(formValues.username)) {
            setError("Username can only contain letters and numbers!");
            return;
        }
        if (formValues.password.length < 8) {
            setError("Password must be at least 8 characters long!");
            return;
        }
        if (formValues.password !== formValues.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setIsSubmitting(true);
        try {
            await registerSubmitHandler(formValues);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="register-page" className="page-content">
            <div className="register-page">
                <h1>Create Account</h1>
                <p className="register-subtitle">Join the Bitcoin Learning Hub community</p>

                <form id="register" className="register-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="e.g. SatoshiNakamoto"
                            required
                            value={formValues.username}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="your@email.com"
                            required
                            value={formValues.email}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Min. 8 characters"
                            required
                            value={formValues.password}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Repeat your password"
                            required
                            value={formValues.confirmPassword}
                            onChange={changeHandler}
                        />
                    </div>

                    {error && <p className="field-error">{error}</p>}

                    <input
                        type="submit"
                        value={isSubmitting ? "Creating account..." : "Create Account"}
                        className="btn-submit"
                        disabled={isSubmitting}
                    />

                    <p className="field-text">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}