import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginRequest } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import PasswordField from "../../components/PasswordField";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { token } = await loginRequest(email, password);
            login(token);
            navigate("/admin");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ padding: "78px 0", display: "flex", justifyContent: "center" }}>
            <form onSubmit={handleSubmit} style={{ width: 340, maxWidth: "100%", border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 32 }}>
                <h2 style={{ fontSize: 24, marginBottom: 24 }}>Admin login</h2>

                <label htmlFor="login-email" style={{ display: "block", fontSize: 12, color: "var(--ash)", marginBottom: 6 }}>Email</label>
                <input
                    id="login-email" type="email" required value={email} autoComplete="username"
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: 10, marginBottom: 16, background: "var(--coal)", border: "1px solid var(--ash-dim)", borderRadius: 2, color: "var(--chalk)" }}
                />

                <PasswordField
                    id="login-password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />

                {error && <div style={{ color: "var(--loss)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    {loading ? "Logging in..." : "Log in"}
                </button>

                <div style={{ marginTop: 18, textAlign: "center" }}>
                    <Link to="/admin/forgot-password" style={{ fontSize: 13, color: "var(--ash)", textDecoration: "underline" }}>
                        Forgot your password?
                    </Link>
                </div>
            </form>
        </section>
    );
}
