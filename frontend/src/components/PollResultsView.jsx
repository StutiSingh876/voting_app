import { useEffect, useState } from "react";
import { getPollResults } from "../api/client";

function PollResultsView({ poll, onBack, onVoteAgain }) {
  const [resultsData, setResultsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getPollResults(poll.id);
      setResultsData(data);
    } catch (err) {
      setError(err.message || "Failed to load poll results");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [poll.id]);

  const votesMap = resultsData?.results || {};
  const totalVotes = Object.values(votesMap).reduce((acc, count) => acc + count, 0);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "10px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        maxWidth: "680px",
        margin: "0 auto",
      }}
    >
      {/* Top Header & Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#1890ff",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Back to All Polls
        </button>

        {onVoteAgain && (
          <button
            type="button"
            onClick={onVoteAgain}
            style={{
              background: "none",
              border: "1px solid #1890ff",
              borderRadius: "6px",
              color: "#1890ff",
              fontSize: "0.85rem",
              padding: "6px 12px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ✏️ Go to Voting Form
          </button>
        )}
      </div>

      {/* Poll Header Information */}
      <div style={{ marginBottom: "24px", borderBottom: "1px solid #f0f0f0", pb: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              color: "#52c41a",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            POLL RESULTS
          </span>
          <span style={{ fontSize: "0.85rem", color: "#888", fontWeight: "600" }}>
            Total Votes: {totalVotes}
          </span>
        </div>
        <h2 style={{ margin: "6px 0 8px 0", fontSize: "1.35rem", color: "#1f1f1f" }}>{poll.title}</h2>
        {poll.description && (
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#666", lineHeight: "1.5" }}>{poll.description}</p>
        )}
      </div>

      {isLoading && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#888", fontSize: "0.95rem" }}>
          Loading live results...
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#fff2f0",
            border: "1px solid #ffccc7",
            color: "#ff4d4f",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "0.9rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!isLoading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(votesMap).length === 0 ? (
            <p style={{ color: "#888", fontStyle: "italic", textAlign: "center", py: "20px" }}>
              No options available for this poll.
            </p>
          ) : (
            Object.entries(votesMap).map(([optName, count]) => {
              // Safe percentage calculation: (option_votes / total_votes) * 100
              const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

              return (
                <div key={optName} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                    <span style={{ fontWeight: "600", color: "#262626" }}>{optName}</span>
                    <span style={{ color: "#595959", fontSize: "0.9rem" }}>
                      <strong>{percentage}%</strong> ({count} vote{count !== 1 ? "s" : ""})
                    </span>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div
                    style={{
                      height: "14px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "7px",
                      overflow: "hidden",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: percentage > 0 ? "#1890ff" : "transparent",
                        width: `${percentage}%`,
                        borderRadius: "7px",
                        transition: "width 0.5s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default PollResultsView;
