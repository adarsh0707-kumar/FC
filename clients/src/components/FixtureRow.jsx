export default function FixtureRow({ fixture }) {
    const date = new Date(fixture.date);
    const dateLabel = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
    const timeLabel = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="match-row">
            <div className="mono" style={{ color: "var(--ash)", fontSize: 13 }}>{dateLabel}</div>
            <div className="display match-row__fixture" style={{ fontSize: 15 }}>
                <span className="mono" style={{ color: "var(--brass-bright)", fontSize: 11, marginRight: 8 }}>
                    {fixture.homeAway}
                </span>
                {fixture.homeAway === "HOME"
                    ? `Football Club vs ${fixture.opponent}`
                    : `${fixture.opponent} vs Football Club`}
            </div>
            <span className="badge upcoming">Upcoming</span>
            <div className="mono match-row__score" style={{ textAlign: "center" }}>{timeLabel}</div>
        </div>
    );
}
