import { useState } from "react";
import { registerUser } from "../api/client";

function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState("");
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
      const user = await registerUser({
        username,
        email,
        password,
      });

      setSuccess(`Registration successful for ${user.username}! Please login.`);
      if (onRegisterSuccess) {
        setTimeout(() => onRegisterSuccess(), 1000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <h1>Register</h1>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;