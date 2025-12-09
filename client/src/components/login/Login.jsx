import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
    const { loginSubmitHandler } = useAuth();
    const [error, setError] = useState('');
    const [formValues, setFormValues] = useState({
        email: '',
        password: '',
    });

    const changeHandler = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value
    }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            await loginSubmitHandler(formValues);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section id="login-page" className="page-content">
            <div className="login-page">
                <h1>Login</h1>

                <form id="login" className="login-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" required value={formValues.email} onChange={changeHandler} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" required value={formValues.password} onChange={changeHandler} />
                    </div>

                    {error && (
                        <p className="field-error">{error}</p>
                    )}

                    <input type="submit" value="Login" className="btn-submit" />
                </form>
            </div>
        </section>
    );
}