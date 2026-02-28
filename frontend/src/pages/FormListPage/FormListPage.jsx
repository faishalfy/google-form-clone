/**
 * Form List Page
 * 
 * Displays a list of all forms created by the user.
 * Allows navigation to view, edit, or delete forms.
 * 
 * BEGINNER TIP:
 * - useEffect with empty dependency array runs once on mount
 * - We fetch data from the API and store in local state
 * - Loading and error states provide feedback to the user
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formService } from '../../services';
import { Button, Loader, Alert, Modal } from '../../components/common';
import { FormCard } from '../../components/forms';
import './FormListPage.css';

const FormListPage = () => {
  // State for forms data
  const [forms, setForms] = useState([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    formId: null,
    formTitle: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch forms on component mount
   */
  useEffect(() => {
    fetchForms();
  }, []);

  /**
   * Fetch all forms from API
   */
  const fetchForms = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await formService.getAllForms();
      // Handle both array and object with forms property
      setForms(Array.isArray(data) ? data : data.forms || []);
    } catch (err) {
      setError(err.message || 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Open delete confirmation modal
   */
  const openDeleteModal = (formId, formTitle) => {
    setDeleteModal({
      isOpen: true,
      formId,
      formTitle,
    });
  };

  /**
   * Close delete confirmation modal
   */
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      formId: null,
      formTitle: '',
    });
  };

  /**
   * Handle form deletion
   */
  const handleDelete = async () => {
    if (!deleteModal.formId) return;

    setIsDeleting(true);

    try {
      await formService.deleteForm(deleteModal.formId);
      
      // Remove the deleted form from state
      setForms((prev) => prev.filter((f) => (f._id || f.id) !== deleteModal.formId));
      
      closeDeleteModal();
    } catch (err) {
      setError(err.message || 'Failed to delete form');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return <Loader fullScreen text="Loading your forms..." />;
  }

  return (
    <div className="form-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Forms</h1>
          <p className="page-subtitle">
            Manage and organize your forms
          </p>
        </div>
        <Link to="/forms/create">
          <Button variant="primary">
            + Create New Form
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Forms Grid */}
      {forms.length > 0 ? (
        <div className="forms-grid">
          {forms.map((form) => (
            <FormCard
              key={form._id || form.id}
              form={form}
              onDelete={() => openDeleteModal(form._id || form.id, form.title)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h2>No forms yet</h2>
          <p>Create your first form to get started!</p>
          <Link to="/forms/create">
            <Button variant="primary">
              Create Your First Form
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete Form"
      >
        <div className="delete-modal-content">
          <p>
            Are you sure you want to delete "<strong>{deleteModal.formTitle}</strong>"?
          </p>
          <p className="delete-warning">
            This action cannot be undone.
          </p>
          <div className="delete-modal-actions">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FormListPage;
