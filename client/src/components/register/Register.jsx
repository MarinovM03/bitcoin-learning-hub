import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";
import PageMeta from "../page-meta/PageMeta";
import { registerSchema } from "../../validators/authSchemas";

export default function Register() {
    const { registerSubmitHandler } = useAuth();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            profilePicture: '',
        },
    });

    const onSubmit = async (values) => {
        setServerError('');
        try {
            await registerSubmitHandler(values);
        } catch (err) {
            setServerError(err.message);
        }
    };

    return (
        <section id="register-page" className="page-content">
            <PageMeta title="Create Account" description="Join the Bitcoin Learning Hub community to publish articles, save bookmarks, and earn certifications." />
            <div className="register-page">
                <h1>Create Account</h1>
                <p className="register-subtitle">Join the Bitcoin Learning Hub community</p>

                <form id="register" className="register-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="e.g. SatoshiNakamoto"
                            {...register('username')}
                        />
                        {errors.username && <p className="field-error">{errors.username.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="your@email.com"
                            {...register('email')}
                        />
                        {errors.email && <p className="field-error">{errors.email.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Min. 8 characters"
                            {...register('password')}
                        />
                        {errors.password && <p className="field-error">{errors.password.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Repeat your password"
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
                    </div>

                    {serverError && <p className="field-error">{serverError}</p>}

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
