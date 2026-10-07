function PollDetails({ poll }) {
   console.log("NEW PollDetails loaded");

  if (!poll) {
    return null;
  }

  return (
    <div className="selected-poll">
      <h2>{poll.title}</h2>
      <p>{poll.description}</p>
    </div>
  );
}

export default PollDetails;