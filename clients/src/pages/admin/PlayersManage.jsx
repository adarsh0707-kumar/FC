import { useEffect, useState } from "react";
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from "../../api/players";
import { useAuth } from "../../context/AuthContext";
import { LoadingState, ErrorState } from "../../components/LoadingState";

const emptyForm = { name: "", position: "GK", number: "", goals: 0, assists: 0, appearances: 0, cleanSheets: 0, bio: "" };

export default function PlayersManage() {
    const { token } = useAuth();
    const [players, setPlayers] = useState(null);
    const [error, setError] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [photoFile, setPhotoFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    function loadPlayers() {
        getPlayers().then(setPlayers).catch((e) => setError(e.message));
    }

    useEffect(loadPlayers, []);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    function startEdit(p) {
        setEditingId(p.id);
        setForm({
            name: p.name, position: p.position, number: p.number,
            goals: p.goals, assists: p.assists, appearances: p.appearances,
            cleanSheets: p.cleanSheets, bio: p.bio || "",
        });
        setPhotoFile(null);
    }

    function resetForm() {
        setEditingId(null);
        setForm(emptyForm);
        setPhotoFile(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (photoFile) fd.append("photo", photoFile);

        try {
            if (editingId) {
                await updatePlayer(editingId, fd, token);
            } else {
                await createPlayer(fd, token);
            }
            resetForm();
            loadPlayers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this player?")) return;
        try {
            await deletePlayer(id, token);
            loadPlayers();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section style={{ padding: "78px 0" }}>
            <div className="wrap">
                <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 32 }}>Manage players</h2>

                <form onSubmit={handleSubmit} style={{ border: "1px solid rgba(255,255,255,0.08)", background: "var(--coal-2)", borderRadius: 4, padding: 24, marginBottom: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, alignItems: "end" }}>
                    <div>
                        <label htmlFor="p-name" style={labelStyle}>Name</label>
                        <input id="p-name" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="p-position" style={labelStyle}>Position</label>
                        <select id="p-position" name="position" value={form.position} onChange={handleChange} style={inputStyle}>
                            <option value="GK">GK</option>
                            <option value="DEF">DEF</option>
                            <option value="MID">MID</option>
                            <option value="FWD">FWD</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="p-number" style={labelStyle}>Number</label>
                        <input id="p-number" name="number" type="number" value={form.number} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="p-goals" style={labelStyle}>Goals</label>
                        <input id="p-goals" name="goals" type="number" value={form.goals} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="p-assists" style={labelStyle}>Assists</label>
                        <input id="p-assists" name="assists" type="number" value={form.assists} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="p-appearances" style={labelStyle}>Appearances</label>
                        <input id="p-appearances" name="appearances" type="number" value={form.appearances} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="p-cleanSheets" style={labelStyle}>Clean sheets</label>
                        <input id="p-cleanSheets" name="cleanSheets" type="number" value={form.cleanSheets} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor="p-bio" style={labelStyle}>Bio</label>
                        <input id="p-bio" name="bio" value={form.bio} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="p-photo" style={labelStyle}>Photo</label>
                        <input id="p-photo" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} style={{ fontSize: 13 }} />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            {saving ? "Saving..." : editingId ? "Update player" : "Add player"}
                        </button>
                        {editingId && <button type="button" onClick={resetForm} className="btn btn-ghost">Cancel</button>}
                    </div>
                </form>

                {error && <ErrorState message={error} />}
                {!players && <LoadingState label="Loading players..." />}
                {players && (
                    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", background: "var(--coal-2)" }}>
                        {players.map((p) => (
                            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div>
                                    <strong>#{p.number} {p.name}</strong> <span style={{ color: "var(--ash)", fontSize: 13 }}>({p.position})</span>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button onClick={() => startEdit(p)} className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>Edit</button>
                                    <button onClick={() => handleDelete(p.id)} className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12, color: "var(--loss)" }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

const labelStyle = { display: "block", fontSize: 12, color: "var(--ash)", marginBottom: 4 };
const inputStyle = { width: "100%", padding: 9, background: "var(--coal)", border: "1px solid var(--ash-dim)", borderRadius: 2, color: "var(--chalk)" };
