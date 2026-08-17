import { useId, useState } from "react";

const wrapStyle = { position: "relative", marginBottom: 16 };

const inputStyle = {
    width: "100%",
    padding: "10px 76px 10px 10px", // room for the toggle
    background: "var(--coal)",
    border: "1px solid var(--ash-dim)",
    borderRadius: 2,
    color: "var(--chalk)",
};

const toggleStyle = {
    position: "absolute",
    right: 6,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "var(--ash)",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "6px 8px",
};

/**
 * Password input with a show/hide toggle.
 *
 * The toggle is a real <button type="button"> so it can be reached by keyboard and
 * never submits the surrounding form. Visibility resets to hidden on every mount,
 * so a revealed password can't persist across navigation.
 */
export default function PasswordField({
    label,
    value,
    onChange,
    autoComplete = "current-password",
    required = true,
    hint,
    id,
}) {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const hintId = `${fieldId}-hint`;
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label
                htmlFor={fieldId}
                style={{ display: "block", fontSize: 12, color: "var(--ash)", marginBottom: 6 }}
            >
                {label}
            </label>

            <div style={wrapStyle}>
                <input
                    id={fieldId}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    required={required}
                    autoComplete={autoComplete}
                    aria-describedby={hint ? hintId : undefined}
                    style={inputStyle}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-pressed={visible}
                    aria-label={visible ? "Hide password" : "Show password"}
                    style={toggleStyle}
                >
                    {visible ? "Hide" : "Show"}
                </button>
            </div>

            {hint && (
                <p id={hintId} style={{ marginTop: -8, marginBottom: 16, fontSize: 12, color: "var(--ash)" }}>
                    {hint}
                </p>
            )}
        </div>
    );
}
