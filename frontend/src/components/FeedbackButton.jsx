import React from "react";
import "./FeedbackButton.css";

const FEEDBACK_URL = "https://form.typeform.com/to/InXuXclT";

const FeedbackButton = () => {
  const handleClick = () => {
    window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      className="feedback-button"
      onClick={handleClick}
      aria-label="Give feedback"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
};

export default FeedbackButton;
