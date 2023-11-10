import { useState } from "react";
import { login } from "../../model/repositories";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }: { onLogin: (username: string) => void }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async () => {
		setIsLoading(true);
		setError("");

		const { error, data } = await login(username, password);

		if (error) {
			setError(error.message);
		} else {
			console.log(data.token, data.expiresIn);
			onLogin(username);
			navigate("/"); // Pass the username to the parent component
		}
	};

	return (
		<div id="top" className="shadow-lg p-3 mb-5 bg-white rounded">
			<div id="inner" className="d-fill">
				<div className="mx-auto p-3 rounded">
					<h2>Login</h2>
					{error && <div className="alert alert-danger">{error}</div>}
					<form>
						<div className="mb-3">
							<label htmlFor="username" className="form-label">
								Username
							</label>
							<input
								type="text"
								className="form-control"
								id="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="password" className="form-label">
								Password
							</label>
							<input
								type="password"
								className="form-control"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<button
							type="button"
							className="btn btn-primary"
							onClick={handleLogin}
							disabled={isLoading}
						>
							{isLoading ? "Logging In..." : "login"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default Login;
