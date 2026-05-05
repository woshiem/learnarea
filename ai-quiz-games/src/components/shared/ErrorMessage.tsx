"use client";

type ErrorMessageProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
}: ErrorMessageProps) {
  return (
    <div
      className="animate-scale-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>😟</div>

      <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>
        {title}
      </h3>

      <div
        style={{
          padding: "16px 20px",
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          borderRadius: "12px",
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
          lineHeight: 1.6,
          marginBottom: "24px",
          maxWidth: "360px",
        }}
      >
        {message}
      </div>

      {onRetry && (
        <button id="error-retry-btn" onClick={onRetry} className="btn-primary">
          🔄 {retryLabel}
        </button>
      )}
    </div>
  );
}
