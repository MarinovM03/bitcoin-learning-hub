import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";

export default function Register() {
    const { registerSubmitHandler } = useAuth();
    const [error, setError] = useState('');

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

        if (formValues.password !== formValues.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            await registerSubmitHandler(formValues);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section id="register-page" className="page-content">
            <div className="register-page">
                <h1>Register</h1>

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
                            required
                            value={formValues.confirmPassword}
                            onChange={changeHandler}
                        />
                    </div>

                    {error && (
                        <p className="field-error">{error}</p>
                    )}

                    <input type="submit" value="Register" className="btn-submit" />

                    <p className="field-text">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}