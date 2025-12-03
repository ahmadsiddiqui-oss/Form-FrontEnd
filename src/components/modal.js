import React from "react";
import Modal from "react-bootstrap/Modal";

function CustomModal({
  title = "Modal Title",
  body = null,
  onClose = () => {},
  onCancel = () => {},
  onSubmit = () => {},
  submitText = "Submit",
  cancelText = "Cancel",
  modalId = "",
  show
}) {
  return (
    <Modal show={show}>
      <div className="modal-dialog m-0">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}Label`}>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">{body}</div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
              data-bs-dismiss="modal"
            >
              {submitText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CustomModal;
