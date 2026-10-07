import { useState } from "react";
import { voteOnPoll } from "../api/client";

function PollVotingView({ poll, options, onVoteSuccess, onViewResults, onBack }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    if (!selectedOption) {
      setError("Please select an option before submitting your vote.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await voteOnPoll(poll.id, selectedOption);
      if (onVoteSuccess) {
        onVoteSuccess(poll.id);
      }
    } catch (err) {
      // Backend returns HTTP 400 if user has already voted or choice is invalid
      setError(err.message || "Failed to submit vote");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <button
          type="button"
          onClick={() => onViewResults(poll.id)}
          style={{
            background: "none",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            color: "#555",
            fontSize: "0.85rem",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          📊 View Current Results
        </button>
      </div>

      {/* Poll Header Information */}
      <div style={{ marginBottom: "24px", borderBottom: "1px solid #f0f0f0", pb: "16px" }}>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: "700",
            color: "#1890ff",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          ACTIVE VOTING SESSION
        </span>
        <h2 style={{ margin: "6px 0 8px 0", fontSize: "1.35rem", color: "#1f1f1f" }}>{poll.title}</h2>
        {poll.description && (
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#666", lineHeight: "1.5" }}>{poll.description}</p>
        )}
      </div>

      {/* Error Callout */}
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

      {/* Voting Radio Options Form */}
      <form onSubmit={handleSubmitVote}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "0.95rem", color: "#333" }}>
            Choose one option:
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {options.map((opt) => {
              const isSelected = selectedOption === opt.option;
              return (
                <label
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 18px",
                    borderRadius: "8px",
                    border: isSelected ? "2px solid #1890ff" : "1px solid #d9d9d9",
                    backgroundColor: isSelected ? "#e6f7ff" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    type="radio"
                    name="poll_option"
                    value={opt.option}
                    checked={isSelected}
                    onChange={() => {
                      setSelectedOption(opt.option);
                      setError("");
                    }}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontSize: "0.95rem",
                      color: isSelected ? "#096dd9" : "#333",
                      fontWeight: isSelected ? "600" : "400",
                    }}
                  >
                    {opt.option}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit Action Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button
            type="submit"
            disabled={!selectedOption || isSubmitting}
            style={{
              padding: "12px 28px",
              backgroundColor: selectedOption ? "#52c41a" : "#d9d9d9",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "bold",
              cursor: selectedOption && !isSubmitting ? "pointer" : "not-allowed",
              transition: "background-color 0.2s ease",
            }}
          >
            {isSubmitting ? "Submitting Vote..." : "Submit Vote"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PollVotingView;
