import { useEffect, useState } from "react";
import { getFixtures, createFixture, updateFixture, deleteFixture, recordResult } from "../../api/fixtures";
import { useAuth } from "../../context/AuthContext";
import { LoadingState, ErrorState } from "../../components/LoadingState";

const emptyForm = { opponent: "", date: "", homeAway: "HOME" };

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in *local* time,
// whereas the API hands back a UTC ISO string.
function toLocalInputValue(iso) {
    const d = new Date(iso);
    const offsetMs = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function FixturesManage() {
    const { token } = useAuth();
    const [fixtures, setFixtures] = useState(null);
    const [error, setError] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [resultDrafts, setResultDrafts] = useState({}); // { [fixtureId]: { homeScore, awayScore } }

    function loadFixtures() {
        getFixtures().then(setFixtures).catch((e) => setError(e.message));
    }

    useEffect(loadFixtures, []);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function startEdit(f) {
        setEditingId(f.id);
        setForm({
            opponent: f.opponent,
            date: toLocalInputValue(f.date),
            homeAway: f.homeAway,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetForm() {
        setEditingId(null);
        setForm(emptyForm);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const payload = { ...form, date: new Date(form.date).toISOString() };
        try {
            if (editingId) {
                await updateFixture(editingId, payload, token);
            } else {
                await createFixture(payload, token);
            }
            resetForm();
            loadFixtures();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this fixture? Any recorded result will be removed with it.")) return;
        try {
            await deleteFixture(id, token);
            if (editingId === id) resetForm();
            loadFixtures();
        } catch (err) {
            setError(err.message);
        }
    }

    function updateDraft(fixtureId, field, value) {
        setResultDrafts((d) => ({ ...d, [fixtureId]: { ...d[fixtureId], [field]: value } }));
    }

    // Falls back to the already-recorded score so an existing result can be corrected.
    function draftValue(fixture, field) {
        const draft = resultDrafts[fixture.id]?.[field];
        if (draft !== undefined) return draft;
        return fixture.result ? String(fixture.result[field]) : "";
    }

    async function submitResult(fixture) {
        const homeScore = draftValue(fixture, "homeScore");
        const awayScore = draftValue(fixture, "awayScore");
        if (homeScore === "" || awayScore === "") {
            setError("Enter both a home and an away score before recording.");
            return;
        }
        setError(null);
        try {
            await recordResult(
                fixture.id,
                { homeScore: Number(homeScore), awayScore: Number(awayScore) },
                token,
            );
            setResultDrafts((d) => {
                const next = { ...d };
                delete next[fixture.id];
                return next;
            });
            loadFixtures();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap">
                <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 32 }}>Manage fixtures</h2>

                <form onSubmit={handleSubmit} style={{ border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 24, marginBottom: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, alignItems: "end" }}>
                    <div style={{ gridColumn: "1 / -1", fontSize: 13, color: "var(--ash)" }}>
                        {editingId ? "Editing an existing fixture" : "Add a new fixture"}
                    </div>
                    <div>
                        <label htmlFor="opponent" style={labelStyle}>Opponent</label>
                        <input id="opponent" name="opponent" value={form.opponent} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="date" style={labelStyle}>Date &amp; time</label>
                        <input id="date" name="date" type="datetime-local" value={form.date} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="homeAway" style={labelStyle}>Home / Away</label>
                        <select id="homeAway" name="homeAway" value={form.homeAway} onChange={handleChange} style={inputStyle}>
                            <option value="HOME">Home</option>
                            <option value="AWAY">Away</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            {saving ? "Saving..." : editingId ? "Update fixture" : "Add fixture"}
                        </button>
                        {editingId && <button type="button" onClick={resetForm} className="btn btn-ghost">Cancel</button>}
                    </div>
                </form>

                {error && <ErrorState message={error} />}
                {!fixtures && <LoadingState label="Loading fixtures..." />}
                {fixtures && (
                    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", background: "var(--coal-2)" }}>
                        {fixtures.map((f) => (
                            <div key={f.id} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                                    <div>
                                        <strong>{f.homeAway === "HOME" ? `Football Club vs ${f.opponent}` : `${f.opponent} vs Football Club`}</strong>{" "}
                                        <span style={{ color: "var(--ash)", fontSize: 13 }}>
                                            &middot; {new Date(f.date).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                            &middot; {f.status}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => startEdit(f)} className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>Edit</button>
                                        <button onClick={() => handleDelete(f.id)} className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12, color: "var(--loss)" }}>Delete</button>
                                    </div>
                                </div>

                                <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                    <label htmlFor={`home-${f.id}`} style={{ ...labelStyle, marginBottom: 0 }}>Home</label>
                                    <input
                                        id={`home-${f.id}`} type="number" min="0" style={{ ...inputStyle, width: 80 }}
                                        value={draftValue(f, "homeScore")}
                                        onChange={(e) => updateDraft(f.id, "homeScore", e.target.value)}
                                    />
                                    <label htmlFor={`away-${f.id}`} style={{ ...labelStyle, marginBottom: 0 }}>Away</label>
                                    <input
                                        id={`away-${f.id}`} type="number" min="0" style={{ ...inputStyle, width: 80 }}
                                        value={draftValue(f, "awayScore")}
                                        onChange={(e) => updateDraft(f.id, "awayScore", e.target.value)}
                                    />
                                    <button onClick={() => submitResult(f)} className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 12 }}>
                                        {f.result ? "Update result" : "Record result"}
                                    </button>
                                    {f.result && (
                                        <span className="mono" style={{ fontSize: 13, color: "var(--pitch-bright)" }}>
                                            Final: {f.result.homeScore}&ndash;{f.result.awayScore} ({f.result.outcome})
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

const inputStyle = { width: "100%", padding: 9, background: "var(--coal)", border: "1px solid var(--ash-dim)", borderRadius: 2, color: "var(--chalk)" };
const labelStyle = { display: "block", fontSize: 12, color: "var(--ash)", marginBottom: 4 };
