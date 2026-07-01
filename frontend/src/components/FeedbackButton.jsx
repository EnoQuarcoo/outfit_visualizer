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
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M8 12h.01" />
        <path d="M12 12h.01" />
        <path d="M16 12h.01" />
      </svg>
    </button>
  );
};

export default FeedbackButton;
