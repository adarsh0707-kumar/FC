import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import PasswordField from "../../components/PasswordField";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (password !== confirm) {
            setError("The two passwords don't match.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setDone(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const card = { width: 380, maxWidth: "100%", border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 32 };

    // Someone landing here without a token followed a malformed link.
    if (!token) {
        return (
            <section style={{ padding: "78px 0", display: "flex", justifyContent: "center" }}>
                <div style={card}>
                    <h2 style={{ fontSize: 24, marginBottom: 12 }}>Reset password</h2>
                    <p style={{ color: "var(--loss)", fontSize: 14, marginBottom: 20 }}>
                        This reset link is missing its token. Request a new one below.
                    </p>
                    <Link to="/admin/forgot-password" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                        Request a new link
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section style={{ padding: "78px 0", display: "flex", justifyContent: "center" }}>
            <div style={card}>
                <h2 style={{ fontSize: 24, marginBottom: 20 }}>Choose a new password</h2>

                {done ? (
                    <>
                        <p style={{ color: "var(--pitch-bright)", fontSize: 14, marginBottom: 20 }}>
                            Your password has been updated.
                        </p>
                        <Link to="/admin/login" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                            Go to login
                        </Link>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <PasswordField
                            id="reset-password"
                            label="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            hint="At least 10 characters, including a letter and a number."
                        />
                        <PasswordField
                            id="reset-confirm"
                            label="Confirm new password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password"
                        />

                        {error && <div style={{ color: "var(--loss)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                            {loading ? "Updating..." : "Update password"}
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
