import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formErrors, setFormErrors] = useState({});

    // If already authenticated, redirect to dashboard
    useEffect(() => {
        if (store.auth.isAuthenticated) {
            navigate("/dashboard");
        }
    }, [store.auth.isAuthenticated, navigate]);

    const validateForm = () => {
        const errors = {};
        if (!email) errors.email = "Email is required";
        if (!password) errors.password = "Password is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors
        dispatch({ type: "auth/setError", payload: null });

        // Validate form
        if (!validateForm()) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                dispatch({ type: "auth/setError", payload: data.msg });
                return;
            }

            // Login successful
            dispatch({ type: "auth/login", payload: data });
            navigate("/dashboard");

        } catch (error) {
            dispatch({
                type: "auth/setError",
                payload: "An error occurred while trying to log in. Please try again."
            });
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Login</h2>

                            {/* Show backend error if any */}
                            {store.auth.error && (
                                <div className="alert alert-danger" role="alert">
                                    {store.auth.error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {formErrors.email && (
                                        <div className="invalid-feedback">
                                            {formErrors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {formErrors.password && (
                                        <div className="invalid-feedback">
                                            {formErrors.password}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 