export default function About() {
    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap about-grid">
                <div>
                    <div className="mono" style={{ fontSize: 12, color: "var(--brass-bright)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Our story</div>
                    <h2 style={{ fontSize: "clamp(26px, 3.5vw, 34px)", marginBottom: 20 }}>Built for the community, run by the community</h2>
                    <p style={{ color: "var(--ash)", marginBottom: 16, maxWidth: 520 }}>
                        Football Club has been part of local matchday life for generations, giving players of every age a team to represent and supporters a reason to turn up every weekend.
                    </p>
                    <p style={{ color: "var(--ash)", marginBottom: 16, maxWidth: 520 }}>
                        This site is built to grow with the club: every player card, fixture, and result is pulled live from the database, so team staff can update squads and scores themselves through the admin panel — no code required.
                    </p>
                </div>
                <div className="about-stats">
                    <div><span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 34, color: "var(--brass-bright)" }}>135</span><small style={{ color: "var(--ash)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Years running</small></div>
                    <div><span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 34, color: "var(--brass-bright)" }}>7</span><small style={{ color: "var(--ash)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>League titles</small></div>
                    <div><span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 34, color: "var(--brass-bright)" }}>28</span><small style={{ color: "var(--ash)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Squad players</small></div>
                    <div><span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 34, color: "var(--brass-bright)" }}>1,200</span><small style={{ color: "var(--ash)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Matchday capacity</small></div>
                </div>
            </div>
        </section>
    );
}
