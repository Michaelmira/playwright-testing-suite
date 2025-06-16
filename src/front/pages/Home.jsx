import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Home = () => {
	const navigate = useNavigate();
	const { store, dispatch } = useGlobalReducer();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [signupEmail, setSignupEmail] = useState("");
	const [signupPassword, setSignupPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formErrors, setFormErrors] = useState({});
	const [signupErrors, setSignupErrors] = useState({});

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

	const validateSignupForm = () => {
		const errors = {};
		if (!signupEmail) errors.email = "Email is required";
		if (!signupPassword) errors.password = "Password is required";
		if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
		if (signupPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
		setSignupErrors(errors);
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

	const handleSignup = async (e) => {
		e.preventDefault();

		// Clear previous errors
		dispatch({ type: "auth/setError", payload: null });

		// Validate form
		if (!validateSignupForm()) return;

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: signupEmail,
					password: signupPassword
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				dispatch({ type: "auth/setError", payload: data.msg });
				return;
			}

			// Signup successful
			dispatch({ type: "auth/login", payload: data });
			navigate("/dashboard");

		} catch (error) {
			dispatch({
				type: "auth/setError",
				payload: "An error occurred while trying to sign up. Please try again."
			});
		}
	};

	return (
		<div className="container mt-5">
			<div className="row justify-content-center">
				<div className="col-md-6">
					{/* Login Card */}
					<div className="card mb-4">
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
										data-testid="email-input"
									/>
									{formErrors.email && (
										<div className="invalid-feedback" data-testid="email-error">
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
										data-testid="password-input"
									/>
									{formErrors.password && (
										<div className="invalid-feedback" data-testid="password-error">
											{formErrors.password}
										</div>
									)}
								</div>

								<button type="submit" className="btn btn-primary w-100" data-testid="login-button">
									Login
								</button>
							</form>
						</div>
					</div>

					{/* Signup Card */}
					<div className="card">
						<div className="card-body">
							<h2 className="text-center mb-4">Sign Up</h2>

							<form onSubmit={handleSignup}>
								<div className="mb-3">
									<label htmlFor="signupEmail" className="form-label">
										Email
									</label>
									<input
										type="email"
										className={`form-control ${signupErrors.email ? 'is-invalid' : ''}`}
										id="signupEmail"
										value={signupEmail}
										onChange={(e) => setSignupEmail(e.target.value)}
										data-testid="signup-email-input"
									/>
									{signupErrors.email && (
										<div className="invalid-feedback" data-testid="signup-email-error">
											{signupErrors.email}
										</div>
									)}
								</div>

								<div className="mb-3">
									<label htmlFor="signupPassword" className="form-label">
										Password
									</label>
									<input
										type="password"
										className={`form-control ${signupErrors.password ? 'is-invalid' : ''}`}
										id="signupPassword"
										value={signupPassword}
										onChange={(e) => setSignupPassword(e.target.value)}
										data-testid="signup-password-input"
									/>
									{signupErrors.password && (
										<div className="invalid-feedback" data-testid="signup-password-error">
											{signupErrors.password}
										</div>
									)}
								</div>

								<div className="mb-3">
									<label htmlFor="confirmPassword" className="form-label">
										Confirm Password
									</label>
									<input
										type="password"
										className={`form-control ${signupErrors.confirmPassword ? 'is-invalid' : ''}`}
										id="confirmPassword"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										data-testid="confirm-password-input"
									/>
									{signupErrors.confirmPassword && (
										<div className="invalid-feedback" data-testid="confirm-password-error">
											{signupErrors.confirmPassword}
										</div>
									)}
								</div>

								<button type="submit" className="btn btn-success w-100" data-testid="signup-button">
									Sign Up
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}; 