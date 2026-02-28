/**
 * ConfirmModal Component
 * 
 * A reusable confirmation dialog for destructive actions.
 * 
 * Props:
 * - isOpen: Boolean to control visibility
 * - onClose: Close handler (for cancel action)
 * - onConfirm: Confirm handler (for confirm action)
 * - title: Modal title
 * - message: Confirmation message
 * - confirmText: Confirm button text (default: 'Confirm')
 * - cancelText: Cancel button text (default: 'Cancel')
 * - variant: 'danger' | 'warning' | 'info' (affects confirm button style)
 * - isLoading: Show loading state on confirm button
 * 
 * BEGINNER TIP:
 * - Use this before destructive actions like delete
 * - Always provide clear messaging about the action
 * - The variant prop changes the visual emphasis
 */

import Modal from '../Modal';
import Button from '../Button';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-modal-content">
        <p className="confirm-modal-message">{message}</p>
        
        <div className="confirm-modal-actions">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
