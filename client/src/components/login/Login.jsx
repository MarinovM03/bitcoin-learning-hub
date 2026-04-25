import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";
import PageMeta from "../page-meta/PageMeta";
import { loginSchema } from "../../validators/authSchemas";

export default function Login() {
    const { loginSubmitHandler } = useAuth();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { identifier: '', password: '' },
    });

    const onSubmit = async (values) => {
        setServerError('');
        try {
            await loginSubmitHandler(values);
        } catch (err) {
            setServerError(err.message);
        }
    };

    return (
        <section id="login-page" className="page-content">
            <PageMeta title="Sign In" description="Sign in to your Bitcoin Learning Hub account." />
            <div className="login-page">
                <h1>Welcome Back</h1>
                <p className="login-subtitle">Sign in to your account to continue</p>

                <form id="login" className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-group">
                        <label htmlFor="identifier">Email or Username</label>
                        <input
                            type="text"
                            id="identifier"
                            placeholder="Enter email or username..."
                            {...register('identifier')}
                        />
                        {errors.identifier && <p className="field-error">{errors.identifier.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password..."
                            {...register('password')}
                        />
                        {errors.password && <p className="field-error">{errors.password.message}</p>}
                    </div>

                    {serverError && <p className="field-error">{serverError}</p>}

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
