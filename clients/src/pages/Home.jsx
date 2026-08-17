import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFixtures } from "../api/fixtures";

export default function Home() {
    const [next, setNext] = useState(null);

    useEffect(() => {
        getFixtures("upcoming")
            .then((fixtures) => setNext(fixtures[0] || null))
            .catch(() => setNext(null));
    }, []);

    return (
        <section style={{ padding: "88px 0 56px" }}>
            <div className="wrap">
                <div className="mono" style={{ color: "var(--brass-bright)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 18 }}>
                    Local League &middot; Est. 1889
                </div>
                <h1 style={{ fontSize: "clamp(42px, 7vw, 84px)", lineHeight: 0.98, fontWeight: 700, maxWidth: 820 }}>
                    One club.<br />
                    Built for <span style={{ color: "var(--brass-bright)" }}>matchday.</span>
                </h1>
                <p style={{ marginTop: 22, maxWidth: 520, color: "var(--ash)", fontSize: 16 }}>
                    Full squad profiles, live fixtures and results, and 135 years of history — all in one place for supporters, scouts, and press.
                </p>
                <div style={{ marginTop: 34, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <Link to="/squad" className="btn btn-primary">View the squad</Link>
                    <Link to="/fixtures" className="btn btn-ghost">Fixtures &amp; results</Link>
                </div>

                {next && (
                    <div style={{ marginTop: 48, border: "1px solid rgba(192,138,46,0.3)", background: "var(--coal-2)", borderRadius: 4, padding: "22px 26px", maxWidth: 560, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                        <div>
                            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--ash)", textTransform: "uppercase", marginBottom: 6 }}>Next Fixture</div>
                            <div className="display" style={{ fontSize: 22 }}>
                                {next.homeAway === "HOME" ? `Football Club vs ${next.opponent}` : `${next.opponent} vs Football Club`}
                            </div>
                        </div>
                        <div className="mono" style={{ color: "var(--pitch-bright)", fontSize: 14, whiteSpace: "nowrap" }}>
                            {new Date(next.date).toLocaleString("en-GB", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
