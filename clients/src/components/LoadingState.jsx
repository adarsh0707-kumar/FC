export function LoadingState({ label = "Loading..." }) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ash)" }}>{label}</div>;
}

export function ErrorState({ message = "Something went wrong." }) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "var(--loss)" }}>{message}</div>;
}

export function EmptyState({ message = "Nothing here yet." }) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ash)" }}>{message}</div>;
}
