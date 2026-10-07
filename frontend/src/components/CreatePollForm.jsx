import { useState } from "react";
import { createPoll } from "../api/client";

function CreatePollForm({ onSuccess, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 10) {
      setError("Maximum 10 options allowed per poll.");
      return;
    }
    setOptions([...options, ""]);
    setError("");
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setError("A poll must have at least 2 options.");
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Poll title is required.");
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
    if (cleanOptions.length < 2) {
      setError("Please provide at least 2 non-empty options.");
      return;
    }

    // Check for duplicate options within the same poll
    const uniqueOptions = new Set(cleanOptions);
    if (uniqueOptions.size !== cleanOptions.length) {
      setError("Poll options must all be unique.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: cleanTitle,
        description: description.trim() || null,
        options: cleanOptions,
      };

      const createdPoll = await createPoll(payload);
      setSuccess("Poll created successfully!");

      // Reset form fields
      setTitle("");
      setDescription("");
      setOptions(["", ""]);

      if (onSuccess) {
        onSuccess(createdPoll);
      }
    } catch (err) {
      setError(err.message || "Failed to create poll");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Create New Poll</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#666" }}
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fff2f0",
            border: "1px solid #ffccc7",
            color: "#ff4d4f",
            padding: "10px 14px",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "0.9rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            color: "#52c41a",
            padding: "10px 14px",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "0.9rem",
          }}
        >
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title Field */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
            Poll Question / Title <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Which backend framework do you prefer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.95rem",
              boxSizing: "border-box",
            }}
          />
          <span style={{ fontSize: "0.75rem", color: "#888", display: "block", textAlign: "right", marginTop: "4px" }}>
            {title.length} / 255
          </span>
        </div>

        {/* Description Field */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
            Description & Instructions <span style={{ color: "#888", fontWeight: "normal" }}>(optional)</span>
          </label>
          <textarea
            placeholder="Provide additional context or voting rules..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.95rem",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
          <span style={{ fontSize: "0.75rem", color: "#888", display: "block", textAlign: "right", marginTop: "4px" }}>
            {description.length} / 1000
          </span>
        </div>

        {/* Poll Options Section */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>
            Poll Choices <span style={{ color: "red" }}>*</span>{" "}
            <span style={{ color: "#666", fontWeight: "normal" }}>(Minimum 2 required)</span>
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {options.map((optionText, idx) => (
              <div key={idx} style={{ display: "flex", itemsCenter: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "28px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    color: "#555",
                  }}
                >
                  {idx + 1}
                </span>

                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={optionText}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  maxLength={100}
                  required
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "0.9rem",
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  disabled={options.length <= 2}
                  title={options.length <= 2 ? "Minimum 2 options required" : "Remove option"}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: options.length <= 2 ? "#f5f5f5" : "#fff1f0",
                    color: options.length <= 2 ? "#ccc" : "#ff4d4f",
                    border: `1px solid ${options.length <= 2 ? "#d9d9d9" : "#ffa39e"}`,
                    borderRadius: "6px",
                    cursor: options.length <= 2 ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddOption}
            disabled={options.length >= 10}
            style={{
              marginTop: "12px",
              padding: "8px 14px",
              backgroundColor: "#e6f7ff",
              color: "#1890ff",
              border: "1px dashed #91d5ff",
              borderRadius: "6px",
              cursor: options.length >= 10 ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              width: "100%",
            }}
          >
            + Add Option
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: "10px 18px",
                backgroundColor: "#f5f5f5",
                color: "#555",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "10px 24px",
              backgroundColor: "#1890ff",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            {isLoading ? "Creating Poll..." : "Publish Poll"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePollForm;
