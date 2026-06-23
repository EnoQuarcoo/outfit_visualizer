import "./ImageExpandModal.css";

const ImageExpandModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="image-expand-overlay" onClick={onClose}>
      <img
        className="image-expand-img"
        src={imageUrl}
        alt="Expanded view"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageExpandModal;
