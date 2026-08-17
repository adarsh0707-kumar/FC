import { useEffect, useState } from "react";
import { getPlayers } from "../api/players";
import PlayerCard from "../components/PlayerCard";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";

export default function Squad() {
    const [players, setPlayers] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getPlayers().then(setPlayers).catch((e) => setError(e.message));
    }, []);

    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 10 }}>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>First team squad</h2>
                    <div className="mono" style={{ fontSize: 12, color: "var(--brass-bright)", letterSpacing: "0.14em", textTransform: "uppercase" }}>2026/27 season</div>
                </div>

                {error && <ErrorState message={`Couldn't load the squad: ${error}`} />}
                {!error && !players && <LoadingState label="Loading squad..." />}
                {!error && players && players.length === 0 && <EmptyState message="No players added yet." />}
                {!error && players && players.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 22 }}>
                        {players.map((p) => <PlayerCard key={p.id} player={p} />)}
                    </div>
                )}
            </div>
        </section>
    );
}
