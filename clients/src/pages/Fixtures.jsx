import { useEffect, useState } from "react";
import { getFixtures } from "../api/fixtures";
import FixtureRow from "../components/FixtureRow";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";

export default function Fixtures() {
    const [fixtures, setFixtures] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getFixtures("upcoming").then(setFixtures).catch((e) => setError(e.message));
    }, []);

    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap">
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>Upcoming fixtures</h2>
                </div>

                {error && <ErrorState message={`Couldn't load fixtures: ${error}`} />}
                {!error && !fixtures && <LoadingState label="Loading fixtures..." />}
                {!error && fixtures && fixtures.length === 0 && <EmptyState message="No upcoming fixtures scheduled." />}
                {!error && fixtures && fixtures.length > 0 && (
                    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", background: "var(--coal-2)" }}>
                        {fixtures.map((f) => <FixtureRow key={f.id} fixture={f} />)}
                    </div>
                )}
            </div>
        </section>
    );
}
