/**
 * Create Form Page
 * 
 * Allows users to create a new form with title and description.
 * After creation, redirects to the Form Builder to add questions.
 * 
 * BEGINNER TIP:
 * - Keep it simple: just title and description
 * - Questions are added in a separate Form Builder page
 * - This two-step approach matches the backend API design
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formService } from '../../services';
import { Input, Textarea, Button, Alert, Card } from '../../components/common';
import './CreateFormPage.css';

const CreateFormPage = () => {
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  // UI states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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

    try {
      // Create the form
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      const response = await formService.createForm(submitData);
      
      // Extract form ID from response
      // Response structure: { form: { id: '...' } }
      const createdFormId = response?.form?.id || response?.id;
      
      if (!createdFormId) {
        console.error('No form ID in response:', response);
        throw new Error('Form created but no ID returned');
      }
      
      // Navigate to form builder to add questions
      navigate(`/forms/${createdFormId}/builder`);
    } catch (err) {
      console.error('Form creation error:', err);
      setApiError(err.message || 'Failed to create form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-form-page">
      <div className="page-header">
        <h1 className="page-title">Create New Form</h1>
        <p className="page-subtitle">Start by giving your form a title and description</p>
      </div>

      {apiError && (
        <Alert
          type="error"
          message={apiError}
          onClose={() => setApiError('')}
        />
      )}

      <Card className="create-form-card">
        <form onSubmit={handleSubmit} className="create-form">
          <Input
            label="Form Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter form title (e.g., Customer Feedback Survey)"
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

          <p className="form-hint">
            💡 After creating the form, you'll be able to add questions in the Form Builder.
          </p>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/forms')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Form'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateFormPage;
