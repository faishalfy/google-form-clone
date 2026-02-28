/**
 * Edit Form Page
 * 
 * Allows users to edit form title and description.
 * Questions are edited via the Form Builder page.
 * 
 * BEGINNER TIP:
 * - Backend only accepts title, description, status updates
 * - Questions are managed via separate Form Builder page
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formService } from '../../services';
import { Input, Textarea, Button, Alert, Loader, Card } from '../../components/common';
import '../CreateFormPage/CreateFormPage.css'; // Reuse create form styles

const EditFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [questionCount, setQuestionCount] = useState(0);

  // UI states
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch form data on mount
   */
  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    setIsLoadingForm(true);
    setApiError('');

    try {
      const data = await formService.getFormById(id);
      const form = data.form || data;

      setFormData({
        title: form.title || '',
        description: form.description || '',
      });
      setQuestionCount(form.questions?.length || 0);
    } catch (err) {
      setApiError(err.message || 'Failed to load form');
    } finally {
      setIsLoadingForm(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear success message when user edits
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Form title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      await formService.updateForm(id, submitData);
      setSuccessMessage('Form updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      setApiError(err.message || 'Failed to update form');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingForm) {
    return <Loader fullScreen text="Loading form..." />;
  }

  return (
    <div className="create-form-page">
      <div className="page-header">
        <h1 className="page-title">Edit Form</h1>
        <p className="page-subtitle">Update your form title and description</p>
      </div>

      {apiError && (
        <Alert
          type="error"
          message={apiError}
          onClose={() => setApiError('')}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      <Card className="create-form-card">
        <form onSubmit={handleSubmit} className="create-form">
          <Input
            label="Form Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter form title"
            error={errors.title}
            required
            disabled={isLoading}
          />

          <Textarea
            label="Description (Optional)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a description for your form"
            rows={4}
            disabled={isLoading}
          />

          <div className="form-hint">
            <p style={{ margin: 0 }}>
              📝 This form has <strong>{questionCount}</strong> question{questionCount !== 1 ? 's' : ''}.
            </p>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              <Link to={`/forms/${id}/builder`} style={{ color: 'var(--color-primary)' }}>
                → Go to Form Builder
              </Link> to add or edit questions.
            </p>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/forms/${id}`)}
              disabled={isLoading}
            >
              Back to Form
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditFormPage;
