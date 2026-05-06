"use client";

type JokerPanelProps = {
  fiftyFiftyUsed: boolean;
  audienceUsed: boolean;
  hintUsed: boolean;
  onFiftyFifty: () => void;
  onAudience: () => void;
  onHint: () => void;
  disabled: boolean;
};

export default function JokerPanel({
  fiftyFiftyUsed,
  audienceUsed,
  hintUsed,
  onFiftyFifty,
  onAudience,
  onHint,
  disabled,
}: JokerPanelProps) {
  return (
    <div>
      <p style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "10px",
        textAlign: "center",
      }}>
        Jokerler
      </p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <LifelineButton
          id="lifeline-fifty-fifty"
          icon="50:50"
          label="50:50"
          used={fiftyFiftyUsed}
          disabled={disabled}
          onClick={onFiftyFifty}
          isEmoji={false}
        />
        <LifelineButton
          id="lifeline-audience"
          icon="👥"
          label="Seyirci"
          used={audienceUsed}
          disabled={disabled}
          onClick={onAudience}
        />
        <LifelineButton
          id="lifeline-hint"
          icon="💡"
          label="İpucu"
          used={hintUsed}
          disabled={disabled}
          onClick={onHint}
        />
      </div>
    </div>
  );
}

function LifelineButton({
  id,
  icon,
  label,
  used,
  disabled,
  onClick,
  isEmoji = true,
}: {
  id: string;
  icon: string;
  label: string;
  used: boolean;
  disabled: boolean;
  onClick: () => void;
  isEmoji?: boolean;
}) {
  return (
    <button
      id={id}
      className={`lifeline-btn${used ? " used" : ""}`}
      onClick={onClick}
      disabled={used || disabled}
      title={used ? `${label} kullanıldı` : `${label} jokerini kullan`}
      aria-label={`${label} jokeri${used ? " (kullanıldı)" : ""}`}
    >
      <span
        className="lifeline-icon"
        style={!isEmoji ? {
          fontWeight: 900,
          fontSize: "1rem",
          fontFamily: "monospace",
          color: used ? "inherit" : "var(--gold-400)",
        } : {}}
      >
        {icon}
      </span>
      <span>{label}</span>
      {used && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Kullanıldı</span>}
    </button>
  );
}
