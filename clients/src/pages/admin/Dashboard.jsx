import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 40, flexWrap: "wrap", gap: 10 }}>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>Admin dashboard</h2>
                    <button onClick={handleLogout} className="btn btn-ghost">Log out</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
                    <Link to="/admin/players" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 24 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Manage players</h3>
                        <p style={{ color: "var(--ash)", fontSize: 14 }}>Add, edit, or remove squad members and their stats.</p>
                    </Link>
                    <Link to="/admin/fixtures" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 24 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Manage fixtures</h3>
                        <p style={{ color: "var(--ash)", fontSize: 14 }}>Schedule matches and record final results.</p>
                    </Link>
                    <Link to="/admin/change-password" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 24 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Change password</h3>
                        <p style={{ color: "var(--ash)", fontSize: 14 }}>Update the password used to sign in to this panel.</p>
                    </Link>
                </div>
            </div>
        </section>
    );
}
