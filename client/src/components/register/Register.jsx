import { useState } from "react";

export default function Register({ onRegisterSubmit }) {
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

    const onSubmit = (e) => {
        e.preventDefault();

        if (formValues.password !== formValues.confirmPassword) {
            return;
        }

        onRegisterSubmit(formValues);
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

                    <input type="submit" value="Register" className="btn-submit" />
                </form>
            </div>
        </section>
    );
}