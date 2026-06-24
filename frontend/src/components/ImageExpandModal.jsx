import "./ImageExpandModal.css";

const ImageExpandModal = ({ imageUrl, onClose, onDelete }) => {
  if (!imageUrl) return null;

  return (
    <div className="image-expand-overlay" onClick={onClose}>
      <div className="image-expand-content" onClick={(e) => e.stopPropagation()}>
        <img className="image-expand-img" src={imageUrl} alt="Expanded view" />
        {onDelete && (
          <button
            className="image-expand-delete"
            onClick={onDelete}
            aria-label="Delete image"
            title="Delete"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 7H19"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M9 7V5C9 4.45 9.45 4 10 4H14C14.55 4 15 4.45 15 5V7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 7L7.8 19.1C7.84 19.85 8.46 20.5 9.2 20.5H14.8C15.54 20.5 16.16 19.85 16.2 19.1L17 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="10" y1="10.5" x2="10.3" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="14" y1="10.5" x2="13.7" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageExpandModal;
