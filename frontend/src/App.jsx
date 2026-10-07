import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );
  const [authView, setAuthView] = useState("login");

  useEffect(() => {
    const handleAuthLogout = () => {
      setToken(null);
    };
    window.addEventListener("auth-logout", handleAuthLogout);
    return () => window.removeEventListener("auth-logout", handleAuthLogout);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
  };

  if (!token) {
    return (
      <div className="auth-container" style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
          <button
            onClick={() => setAuthView("login")}
            style={{ fontWeight: authView === "login" ? "bold" : "normal" }}
          >
            Login
          </button>
          <button
            onClick={() => setAuthView("register")}
            style={{ fontWeight: authView === "register" ? "bold" : "normal" }}
          >
            Register
          </button>
        </div>

        {authView === "login" ? (
          <Login
            onLogin={() => setToken(localStorage.getItem("access_token"))}
          />
        ) : (
          <Register
            onRegisterSuccess={() => setAuthView("login")}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", backgroundColor: "#f4f4f4", borderBottom: "1px solid #ddd" }}>
        <h2>Voting Platform</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Logout
        </button>
      </header>
      <main style={{ padding: "20px" }}>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;