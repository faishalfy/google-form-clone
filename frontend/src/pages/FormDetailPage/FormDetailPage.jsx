/**
 * Form Detail Page
 * 
 * Displays a form in read-only preview mode.
 * Shows form title, description, and all questions.
 * 
 * Features:
 * - Preview form structure
 * - Navigate to edit page
 * - Navigate to form builder (manage questions)
 * - Navigate to respondent view
 * - Share form link
 * - Change form status (draft/published/closed)
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formService, questionService } from '../../services';
import { Button, Loader, Alert, Select } from '../../components/common';
import { QuestionPreview } from '../../components/forms';
import './FormDetailPage.css';

// Form status options
const STATUS_OPTIONS = [
  { value: 'draft', label: '📝 Draft - Not accepting responses' },
  { value: 'published', label: '✅ Published - Accepting responses' },
  { value: 'closed', label: '🔒 Closed - No longer accepting responses' },
];

const FormDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  /**
   * Fetch form data and questions on mount
   */
  useEffect(() => {
    fetchFormData();
  }, [id]);

  const fetchFormData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch form details
      const formData = await formService.getFormById(id);
      const loadedForm = formData.form || formData;
      setForm(loadedForm);

      // Fetch questions separately for accurate count
      try {
        const questionData = await questionService.getQuestions(id);
        setQuestions(questionData.questions || questionData || []);
      } catch {
        // If questions endpoint fails, use form.questions if available
        setQuestions(loadedForm.questions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load form');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copy form link to clipboard
   */
  const copyFormLink = async () => {
    const formLink = `${window.location.origin}/forms/${id}/respond`;
    
    try {
      await navigator.clipboard.writeText(formLink);
      setCopySuccess('Link copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch {
      setCopySuccess('Failed to copy');
    }
  };

  /**
   * Handle status change
   */
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    if (newStatus === form.status) return;
    
    setIsUpdatingStatus(true);
    setStatusMessage('');
    
    try {
      await formService.updateForm(id, { status: newStatus });
      setForm(prev => ({ ...prev, status: newStatus }));
      setStatusMessage(`Form ${newStatus === 'published' ? 'published' : newStatus === 'closed' ? 'closed' : 'set to draft'} successfully!`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setStatusMessage(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading form..." />;
  }

  if (error) {
    return (
      <div className="form-detail-page">
        <Alert type="error" message={error} />
        <Link to="/forms">
          <Button variant="outline">Back to Forms</Button>
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="form-detail-page">
        <Alert type="error" message="Form not found" />
        <Link to="/forms">
          <Button variant="outline">Back to Forms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="form-detail-page">
      {/* Page Header */}
      <div className="form-detail-header">
        <Button
          variant="outline"
          size="small"
          onClick={() => navigate('/forms')}
        >
          ← Back to Forms
        </Button>
        <div className="form-detail-actions">
          <Link to={`/forms/${id}/edit`}>
            <Button variant="outline" size="small">
              Edit Details
            </Button>
          </Link>
          <Link to={`/forms/${id}/builder`}>
            <Button variant="secondary" size="small">
              Manage Questions
            </Button>
          </Link>
          <Link to={`/forms/${id}/analytics`}>
            <Button variant="secondary" size="small">
              📊 Analytics
            </Button>
          </Link>
          <Link to={`/forms/${id}/respond`}>
            <Button variant="primary" size="small">
              Fill Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Form Preview */}
      <div className="form-preview-container">
        {/* Form Header */}
        <div className="form-preview-header">
          <h1 className="form-preview-title">{form.title || 'Untitled Form'}</h1>
          {form.description && (
            <p className="form-preview-description">{form.description}</p>
          )}
        </div>

        {/* Form Status */}
        <div className="form-status-section">
          <div className="status-control">
            <label className="status-label">Form Status:</label>
            <select
              className="status-select"
              value={form.status || 'draft'}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isUpdatingStatus && <span className="status-loading">Updating...</span>}
          </div>
          {statusMessage && (
            <p className={`status-message ${statusMessage.includes('Failed') ? 'error' : 'success'}`}>
              {statusMessage}
            </p>
          )}
          <p className="status-hint">
            {form.status === 'published' 
              ? '✅ This form is live and accepting responses.'
              : form.status === 'closed'
              ? '🔒 This form is closed and not accepting responses.'
              : '📝 This form is in draft mode. Publish it to start collecting responses.'}
          </p>
        </div>

        {/* Share Link */}
        <div className="form-share-section">
          <span className="share-label">Share this form:</span>
          <code className="share-link">
            {window.location.origin}/forms/{id}/respond
          </code>
          <Button variant="outline" size="small" onClick={copyFormLink}>
            {copySuccess || 'Copy Link'}
          </Button>
        </div>

        {/* Questions */}
        <div className="form-preview-questions">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <QuestionPreview
                key={question._id || question.id || index}
                question={question}
                index={index}
              />
            ))
          ) : (
            <div className="no-questions">
              <p>This form has no questions yet.</p>
              <Link to={`/forms/${id}/builder`}>
                <Button variant="primary">Add Questions</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Form Footer */}
        <div className="form-preview-footer">
          <p className="form-preview-meta">
            {questions.length} question(s)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormDetailPage;
