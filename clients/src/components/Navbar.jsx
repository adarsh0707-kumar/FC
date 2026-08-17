import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(20,17,15,0.92)", backdropFilter: "blur(6px)", borderBottom: "1px solid rgba(192,138,46,0.25)" }}>
            <div className="wrap nav-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: "50%",
                        background: "conic-gradient(from 180deg, var(--pitch) 0deg 180deg, var(--brass) 180deg 360deg)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid var(--chalk)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                    }}>FC</div>
                    <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "0.06em" }}>
                        FOOTBALL <span style={{ color: "var(--brass-bright)" }}>CLUB</span>
                    </span>
                </Link>
                <nav className="nav-links">
                    <Link to="/squad">Squad</Link>
                    <Link to="/fixtures">Fixtures</Link>
                    <Link to="/results">Results</Link>
                    <Link to="/about">Club</Link>
                    <Link to="/admin" style={{ color: "var(--ash)" }}>Admin</Link>
                </nav>
            </div>
        </header>
    );
}
