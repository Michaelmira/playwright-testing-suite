import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();

	const handleLogout = () => {
		dispatch({ type: "auth/logout" });
		navigate("/");
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
			<div className="container">
				<Link to={store.auth.isAuthenticated ? "/dashboard" : "/"}>
					<span className="navbar-brand mb-0 h1">Excel File Manager</span>
				</Link>

				{store.auth.isAuthenticated ? (
					<div className="d-flex align-items-center">
						<span className="me-3">
							Welcome, {store.auth.user?.email}
						</span>
						<button
							className="btn btn-outline-danger"
							onClick={handleLogout}
							data-testid="navbar-logout"
						>
							Logout
						</button>
					</div>
				) : null}
			</div>
		</nav>
	);
};