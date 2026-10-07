import { useState } from "react";
import { loginUser, getCurrentUser } from "../api/client";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await loginUser({
        email,
        password,
      });

      localStorage.setItem("access_token", data.access_token);

      const user = await getCurrentUser();
      setSuccess(`Welcome ${user.username}!`);

      if (onLogin) {
        onLogin(user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <h1>Login</h1>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;