import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Token kept in memory only (not localStorage) to reduce XSS exposure.
// Trade-off: a hard refresh logs the admin out; acceptable for this app's scale.
// See docs/03-ARCHITECTURE.md ("Auth flow") for the documented reasoning.
export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);

    const value = {
        token,
        isAuthenticated: Boolean(token),
        login: (t) => setToken(t),
        logout: () => setToken(null),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
