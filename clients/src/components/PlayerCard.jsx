import { Link } from "react-router-dom";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace("/api", "");

export default function PlayerCard({ player }) {
    const photoSrc = player.photoUrl ? `${API_ORIGIN}${player.photoUrl}` : null;

    return (
        <Link
            to={`/squad/${player.id}`}
            className="player-card"
            aria-label={`View profile for ${player.name}`}
            style={{ display: "block", border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, overflow: "hidden" }}
        >
            <div style={{ aspectRatio: "4/5", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: photoSrc ? `url(${photoSrc}) center/cover` : "linear-gradient(160deg, var(--pitch), var(--coal))" }}>
                <span style={{ position: "absolute", top: 10, left: 10, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", background: "rgba(20,17,15,0.65)", padding: "4px 8px", borderRadius: 2, textTransform: "uppercase" }}>
                    {player.position}
                </span>
                {!photoSrc && (
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 64, color: "rgba(242,239,230,0.92)" }}>
                        {player.number}
                    </span>
                )}
            </div>
            <div style={{ padding: "16px 16px 18px" }}>
                <h3 style={{ fontSize: 17, marginBottom: 2 }}>{player.name}</h3>
                <div style={{ color: "var(--ash)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    #{player.number}
                </div>
                <div style={{ display: "flex", gap: 16, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    <div><span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{player.goals}</span><small style={{ color: "var(--ash)" }}>Goals</small></div>
                    <div><span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{player.assists}</span><small style={{ color: "var(--ash)" }}>Assists</small></div>
                    <div><span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{player.appearances}</span><small style={{ color: "var(--ash)" }}>Apps</small></div>
                </div>
            </div>
        </Link>
    );
}
