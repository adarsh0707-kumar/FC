import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import PasswordField from "../../components/PasswordField";

export default function ChangePassword() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [current, setCurrent] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (password !== confirm) {
            setError("The two new passwords don't match.");
            return;
        }

        setLoading(true);
        try {
            await changePassword(current, password, token);
            setDone(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleReLogin() {
        logout();
        navigate("/admin/login");
    }

    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap" style={{ maxWidth: 460 }}>
                <Link
                    to="/admin"
                    className="mono"
                    style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ash)" }}
                >
                    &larr; Back to dashboard
                </Link>

                <h2 style={{ fontSize: "clamp(26px, 4vw, 34px)", margin: "22px 0 24px" }}>Change password</h2>

                <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 28 }}>
                    {done ? (
                        <>
                            <p style={{ color: "var(--pitch-bright)", fontSize: 14, marginBottom: 8 }}>
                                Your password has been updated.
                            </p>
                            <p style={{ color: "var(--ash)", fontSize: 13, marginBottom: 20 }}>
                                Your current session stays valid until it expires. Log in again to
                                start a fresh one.
                            </p>
                            <button onClick={handleReLogin} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                                Log in again
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <PasswordField
                                id="cp-current"
                                label="Current password"
                                value={current}
                                onChange={(e) => setCurrent(e.target.value)}
                                autoComplete="current-password"
                            />
                            <PasswordField
                                id="cp-new"
                                label="New password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                hint="At least 10 characters, including a letter and a number."
                            />
                            <PasswordField
                                id="cp-confirm"
                                label="Confirm new password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                autoComplete="new-password"
                            />

                            {error && <div style={{ color: "var(--loss)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                                {loading ? "Updating..." : "Update password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
