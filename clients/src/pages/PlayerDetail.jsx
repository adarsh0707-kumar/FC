import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPlayer } from "../api/players";
import { LoadingState, ErrorState } from "../components/LoadingState";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace("/api", "");

const POSITION_LABEL = {
    GK: "Goalkeeper",
    DEF: "Defender",
    MID: "Midfielder",
    FWD: "Forward",
};

export default function PlayerDetail() {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        setPlayer(null);
        setError(null);
        getPlayer(id).then(setPlayer).catch((e) => setError(e.message));
    }, [id]);

    const photoSrc = player?.photoUrl ? `${API_ORIGIN}${player.photoUrl}` : null;

    // Clean sheets only mean something for a keeper; goals/assists only for outfielders.
    const stats = player
        ? [
              { label: "Appearances", value: player.appearances },
              { label: "Goals", value: player.goals },
              { label: "Assists", value: player.assists },
              ...(player.position === "GK"
                  ? [{ label: "Clean sheets", value: player.cleanSheets }]
                  : []),
          ]
        : [];

    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap">
                <Link
                    to="/squad"
                    className="mono"
                    style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ash)" }}
                >
                    &larr; Back to squad
                </Link>

                {error && <ErrorState message={`Couldn't load this player: ${error}`} />}
                {!error && !player && <LoadingState label="Loading player..." />}

                {!error && player && (
                    <div className="player-detail" style={{ marginTop: 28 }}>
                        <div
                            style={{
                                aspectRatio: "4/5",
                                borderRadius: 4,
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: photoSrc
                                    ? `url(${photoSrc}) center/cover`
                                    : "linear-gradient(160deg, var(--pitch), var(--coal))",
                            }}
                        >
                            {!photoSrc && (
                                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 96, color: "rgba(242,239,230,0.92)" }}>
                                    {player.number}
                                </span>
                            )}
                        </div>

                        <div>
                            <div
                                className="mono"
                                style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--brass-bright)", marginBottom: 10 }}
                            >
                                #{player.number} &middot; {POSITION_LABEL[player.position] || player.position}
                            </div>

                            <h2 style={{ fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05, marginBottom: 22 }}>
                                {player.name}
                            </h2>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
                                    gap: 18,
                                    padding: "20px 0",
                                    borderTop: "1px solid rgba(255,255,255,0.08)",
                                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                                    marginBottom: 26,
                                }}
                            >
                                {stats.map((s) => (
                                    <div key={s.label}>
                                        <span
                                            style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 30, color: "var(--brass-bright)", lineHeight: 1.1 }}
                                        >
                                            {s.value}
                                        </span>
                                        <small style={{ color: "var(--ash)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                            {s.label}
                                        </small>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ fontSize: 15, marginBottom: 10, color: "var(--ash)", letterSpacing: "0.1em" }}>
                                Profile
                            </h3>
                            <p style={{ color: player.bio ? "var(--chalk)" : "var(--ash)", maxWidth: 560, fontStyle: player.bio ? "normal" : "italic" }}>
                                {player.bio || "No profile has been written for this player yet."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
