import Button from "./Button";
import "./DeleteAccountModal.css";

const DeleteAccountModal = ({ onClose, onConfirm, isDeleting }) => {
  return (
    <div className="delete-account-overlay" onClick={onClose}>
      <div
        className="delete-account-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="delete-account-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="delete-account-title">Delete account?</h2>
        <p className="delete-account-message">
          This action is permanent. Your account, wardrobe, and generated
          outfits will be deleted and cannot be recovered.
        </p>

        <Button
          text={isDeleting ? "Deleting..." : "Delete account"}
          onClick={onConfirm}
          disabled={isDeleting}
        />
      </div>
    </div>
  );
};

export default DeleteAccountModal;
