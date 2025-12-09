import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
    const { registerSubmitHandler } = useAuth();
    const [error, setError] = useState('');
    const [formValues, setFormValues] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const changeHandler = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

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
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" required value={formValues.email} onChange={changeHandler} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" required value={formValues.password} onChange={changeHandler} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required value={formValues.confirmPassword} onChange={changeHandler} />
                    </div>

                    {error && (
                        <p className="field-error">{error}</p>
                    )}

                    <input type="submit" value="Register" className="btn-submit" />
                </form>
            </div>
        </section>
    );
}