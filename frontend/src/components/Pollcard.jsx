function PollCard({ poll, onOpenVote, onOpenResults }) {
  const optionCount = poll.options ? poll.options.length : 0;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        padding: "18px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        justifySpace: "space-between",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div>
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "1.1rem",
            color: "#1f1f1f",
            fontWeight: "700",
            lineHeight: "1.3",
          }}
        >
          {poll.title}
        </h3>

        {poll.description && (
          <p
            style={{
              margin: "0 0 14px 0",
              fontSize: "0.88rem",
              color: "#666",
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {poll.description}
          </p>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          paddingTop: "12px",
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
          justifySpace: "space-between",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: "500" }}>
          {optionCount} choice{optionCount !== 1 ? "s" : ""}
        </span>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => onOpenResults(poll.id)}
            title="View current results"
            style={{
              padding: "6px 12px",
              backgroundColor: "#f5f5f5",
              color: "#595959",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            📊 Results
          </button>

          <button
            type="button"
            onClick={() => onOpenVote(poll.id)}
            style={{
              padding: "6px 14px",
              backgroundColor: "#1890ff",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Open Poll
          </button>
        </div>
      </div>
    </div>
  );
}

export default PollCard;