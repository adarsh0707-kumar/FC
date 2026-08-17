export default function Footer() {
    return (
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "36px 0", color: "var(--ash)", fontSize: 13 }}>
            <div className="wrap" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>Football Club &middot; Home Ground &middot; Est. 1889</div>
                <div>Built by Adarsh Kumar &middot; adarsh0707-kumar</div>
            </div>
        </footer>
    );
}
