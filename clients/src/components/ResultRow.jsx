const badgeClass = { W: "w", D: "d", L: "l" };
const badgeLabel = { W: "Win", D: "Draw", L: "Loss" };

export default function ResultRow({ result }) {
    const date = new Date(result.date);
    const dateLabel = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();

    return (
        <div className="match-row">
            <div className="mono" style={{ color: "var(--ash)", fontSize: 13 }}>{dateLabel}</div>
            <div className="display match-row__fixture" style={{ fontSize: 15 }}>
                <span className="mono" style={{ color: "var(--brass-bright)", fontSize: 11, marginRight: 8 }}>
                    {result.homeAway}
                </span>
                {result.homeAway === "HOME"
                    ? `Football Club vs ${result.opponent}`
                    : `${result.opponent} vs Football Club`}
            </div>
            <span className={`badge ${badgeClass[result.outcome]}`}>{badgeLabel[result.outcome]}</span>
            <div className="mono match-row__score" style={{ textAlign: "center", fontSize: 16, fontWeight: 600 }}>
                {result.homeScore}&ndash;{result.awayScore}
            </div>
        </div>
    );
}
