import { useEffect, useState } from "react";
import { getResults } from "../api/results";
import ResultRow from "../components/ResultRow";
import { LoadingState, ErrorState, EmptyState } from "../components/LoadingState";

export default function Results() {
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getResults().then(setResults).catch((e) => setError(e.message));
    }, []);

    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap">
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>Recent results</h2>
                </div>

                {error && <ErrorState message={`Couldn't load results: ${error}`} />}
                {!error && !results && <LoadingState label="Loading results..." />}
                {!error && results && results.length === 0 && <EmptyState message="No results recorded yet." />}
                {!error && results && results.length > 0 && (
                    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", background: "var(--coal-2)" }}>
                        {results.map((r) => <ResultRow key={r.fixtureId} result={r} />)}
                    </div>
                )}
            </div>
        </section>
    );
}
