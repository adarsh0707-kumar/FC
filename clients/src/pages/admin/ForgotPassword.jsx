import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await forgotPassword(email);
            // The API deliberately answers the same way whether or not the address
            // exists, so the UI must not imply that a match was found.
            setSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ padding: "78px 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 380, maxWidth: "100%", border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 32 }}>
                <h2 style={{ fontSize: 24, marginBottom: 12 }}>Reset password</h2>

                {sent ? (
                    <>
                        <p style={{ color: "var(--ash)", fontSize: 14, marginBottom: 20 }}>
                            If that email matches an admin account, a reset link is on its way.
                            The link expires in 30 minutes and can only be used once.
                        </p>
                        <Link to="/admin/login" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                            Back to login
                        </Link>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p style={{ color: "var(--ash)", fontSize: 14, marginBottom: 20 }}>
                            Enter the email on the admin account and we&rsquo;ll send a link to choose a new password.
                        </p>

                        <label htmlFor="forgot-email" style={{ display: "block", fontSize: 12, color: "var(--ash)", marginBottom: 6 }}>Email</label>
                        <input
                            id="forgot-email" type="email" required value={email} autoComplete="username"
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "100%", padding: 10, marginBottom: 16, background: "var(--coal)", border: "1px solid var(--ash-dim)", borderRadius: 2, color: "var(--chalk)" }}
                        />

                        {error && <div style={{ color: "var(--loss)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                            {loading ? "Sending..." : "Send reset link"}
                        </button>

                        <div style={{ marginTop: 18, textAlign: "center" }}>
                            <Link to="/admin/login" style={{ fontSize: 13, color: "var(--ash)", textDecoration: "underline" }}>
                                Back to login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
