import { useState } from "react";
import { useNavigate } from "react-router";
import * as authService from '../../services/authService';

export default function Login() {
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState({
        email: '',
        password: '',
    });

    const changeHandler = (e) => {
        setFormValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const loginSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            const result = await authService.login(formValues.email, formValues.password);

            // --- TEMPORARY: Save token directly so Create/Delete works ---
            // Later we will move this logic to AuthContext
            localStorage.setItem('auth', JSON.stringify(result));
            
            navigate('/');
        } catch (err) {
            console.log('Login Error:', err.message);
        }
    };

    return (
        <section id="login-page" className="page-content">
            <div className="login-page">
                <h1>Login</h1>

                <form id="login" className="login-form" onSubmit={loginSubmitHandler}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="Satoshi@bitcoin.com"
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
                            placeholder="********" 
                            required
                            value={formValues.password}
                            onChange={changeHandler}
                        />
                    </div>

                    <input type="submit" value="Login" className="btn-submit" />
                </form>
            </div>
        </section>
    );
}