import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";
import PageMeta from "../page-meta/PageMeta";

export default function Login() {
    const { loginSubmitHandler } = useAuth();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formValues, setFormValues] = useState({
        identifier: '',
        password: '',
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
        setIsSubmitting(true);
        try {
            await loginSubmitHandler(formValues);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="login-page" className="page-content">
            <PageMeta title="Sign In" description="Sign in to your Bitcoin Learning Hub account." />
            <div className="login-page">
                <h1>Welcome Back</h1>
                <p className="login-subtitle">Sign in to your account to continue</p>

                <form id="login" className="login-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="identifier">Email or Username</label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            placeholder="Enter email or username..."
                            required
                            value={formValues.identifier}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password..."
                            required
                            value={formValues.password}
                            onChange={changeHandler}
                        />
                    </div>

                    {error && <p className="field-error">{error}</p>}

                    <input
                        type="submit"
                        value={isSubmitting ? "Signing in..." : "Sign In"}
                        className="btn-submit"
                        disabled={isSubmitting}
                    />

                    <p className="field-text">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}