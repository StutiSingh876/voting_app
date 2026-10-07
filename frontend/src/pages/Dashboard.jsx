import { useEffect, useState } from "react";
import {
  getPolls,
  getPollById,
  getPollOptions,
} from "../api/client";
import PollCard from "../components/Pollcard";
import CreatePollForm from "../components/CreatePollForm";
import PollVotingView from "../components/PollVotingView";
import PollResultsView from "../components/PollResultsView";

function Dashboard() {
  // Navigation view state: 'list' | 'create' | 'vote' | 'results'
  const [currentView, setCurrentView] = useState("list");

  // Data states
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [activeOptions, setActiveOptions] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPollsList = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getPolls();
      setPolls(data || []);
    } catch (err) {
      setError(err.message || "Failed to load polls from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPollsList();
  }, []);

  const handleOpenVote = async (pollId) => {
    try {
      setIsLoading(true);
      setError("");
      const poll = await getPollById(pollId);
      const pollOptions = await getPollOptions(pollId);

      setActivePoll(poll);
      setActiveOptions(pollOptions);
      setCurrentView("vote");
    } catch (err) {
      setError(err.message || "Failed to load poll details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenResults = async (pollId) => {
    try {
      setIsLoading(true);
      setError("");
      const poll = await getPollById(pollId);

      setActivePoll(poll);
      setCurrentView("results");
    } catch (err) {
      setError(err.message || "Failed to load poll details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePollCreated = async (newPoll) => {
    await fetchPollsList();
    if (newPoll && newPoll.id) {
      handleOpenVote(newPoll.id);
    } else {
      setCurrentView("list");
    }
  };

  const handleVoteSuccess = (pollId) => {
    handleOpenResults(pollId);
  };

  const handleBackToList = () => {
    setActivePoll(null);
    setActiveOptions([]);
    setCurrentView("list");
    fetchPollsList();
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "10px 0" }}>

      {/* Global Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: "#fff2f0",
            border: "1px solid #ffccc7",
            color: "#ff4d4f",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            justifySpace: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={fetchPollsList}
            style={{
              padding: "4px 12px",
              backgroundColor: "#ff4d4f",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* VIEW 1: CREATE POLL FORM */}
      {currentView === "create" && (
        <CreatePollForm
          onSuccess={handlePollCreated}
          onCancel={handleBackToList}
        />
      )}

      {/* VIEW 2: OPEN POLL VOTING VIEW */}
      {currentView === "vote" && activePoll && (
        <PollVotingView
          poll={activePoll}
          options={activeOptions}
          onVoteSuccess={handleVoteSuccess}
          onViewResults={handleOpenResults}
          onBack={handleBackToList}
        />
      )}

      {/* VIEW 3: POLL RESULTS VIEW */}
      {currentView === "results" && activePoll && (
        <PollResultsView
          poll={activePoll}
          onBack={handleBackToList}
          onVoteAgain={() => handleOpenVote(activePoll.id)}
        />
      )}

      {/* VIEW 4: AVAILABLE POLLS DASHBOARD LIST */}
      {currentView === "list" && (
        <div>
          <div
            style={{
              display: "flex",
              justifySpace: "between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "14px",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "1.6rem", color: "#1f1f1f" }}>Available Polls</h1>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "#666" }}>
                Participate in active polls or create a new one.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView("create")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1890ff",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(24,144,255,0.2)",
              }}
            >
              + Create New Poll
            </button>
          </div>

          {isLoading && (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#888", fontSize: "1rem" }}>
              Loading available polls from backend...
            </div>
          )}

          {!isLoading && polls.length === 0 && (
            <div
              style={{
                padding: "50px 20px",
                textAlign: "center",
                backgroundColor: "#fafafa",
                border: "2px dashed #e8e8e8",
                borderRadius: "10px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", color: "#555" }}>No active polls found</h3>
              <p style={{ margin: "0 0 16px 0", color: "#888", fontSize: "0.9rem" }}>
                Be the first to ask a question!
              </p>
              <button
                type="button"
                onClick={() => setCurrentView("create")}
                style={{
                  padding: "8px 18px",
                  backgroundColor: "#1890ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Create a Poll
              </button>
            </div>
          )}

          {!isLoading && polls.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              }}
            >
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onOpenVote={handleOpenVote}
                  onOpenResults={handleOpenResults}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;