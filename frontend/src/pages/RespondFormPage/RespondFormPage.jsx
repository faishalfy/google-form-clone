/**
 * RespondFormPage
 * 
 * Respondent view for filling out and submitting a form.
 * Dynamically renders input fields based on question types.
 * 
 * Route: /forms/:formId/respond
 * 
 * Features:
 * - Fetches form details and questions
 * - Renders dynamic inputs based on question type
 * - Validates required fields
 * - Submits answers to API
 * - Shows success/error messages
 * 
 * BEGINNER TIP:
 * - This page is PUBLIC (optional authentication)
 * - Answers are stored in local state until submission
 * - Each question type has a specific input component
 * 
 * SCALABILITY NOTE (10,000+ users):
 * - Form data is cached/memoized to prevent re-fetching
 * - Validation is done client-side before API call
 * - Consider adding rate limiting on backend
 * - Add captcha for anonymous submissions
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formService, questionService, responseService } from '../../services';
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  RadioGroup, 
  CheckboxGroup, 
  Alert, 
  Loader 
} from '../../components/common';
import './RespondFormPage.css';

const RespondFormPage = () => {
  const { id: formId } = useParams();

  // Form and questions state
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // Answers state - keyed by question ID
  const [answers, setAnswers] = useState({});
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Load form and questions
   */
  useEffect(() => {
    const loadFormData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetch form details
        const formData = await formService.getFormById(formId);
        const loadedForm = formData.form || formData;
        setForm(loadedForm);

        // Fetch questions
        const questionData = await questionService.getQuestions(formId);
        const loadedQuestions = questionData.questions || questionData || [];
        setQuestions(loadedQuestions);

        // Initialize answers state
        const initialAnswers = {};
        loadedQuestions.forEach((q) => {
          const questionId = q.id || q._id;
          // Initialize checkbox answers as empty array, others as empty string
          initialAnswers[questionId] = q.type === 'checkbox' ? [] : '';
        });
        setAnswers(initialAnswers);

      } catch (err) {
        setError(err.message || 'Failed to load form');
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [formId]);

  /**
   * Handle answer change
   * 
   * @param {string} questionId - The question ID
   * @param {string|Array} value - The answer value
   */
  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  }, [validationErrors]);

  /**
   * Validate all required fields
   */
  const validateForm = () => {
    const errors = {};

    questions.forEach((question) => {
      const questionId = question.id || question._id;
      const answer = answers[questionId];

      // Backend uses 'is_required', but we also check 'required' for compatibility
      if (question.is_required || question.required) {
        // Check if answer is empty
        const isEmpty = question.type === 'checkbox'
          ? !answer || answer.length === 0
          : !answer || !answer.toString().trim();

        if (isEmpty) {
          errors[questionId] = 'This question is required';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorId = Object.keys(validationErrors)[0];
      const firstErrorElement = document.getElementById(`question-${firstErrorId}`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare answers array for API
      // NOTE: Backend expects 'question_id' (snake_case), not 'questionId' (camelCase)
      const answersArray = questions
        .map((question) => {
          const questionId = question.id || question._id;
          const answer = answers[questionId];

          // Skip empty answers for non-required questions
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            return null;
          }

          return {
            question_id: questionId,
            value: answer,
          };
        })
        .filter(Boolean);

      // Submit response
      await responseService.submitResponse(formId, { answers: answersArray });

      // Show success state
      setIsSubmitted(true);

    } catch (err) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render question input based on type
   * 
   * DYNAMIC RENDERING LOGIC:
   * - short_answer: Text input for short responses
   * - paragraph: Textarea for long responses
   * - multiple_choice: Radio buttons (single selection)
   * - checkbox: Checkbox group (multiple selection)
   * - dropdown: Select dropdown (single selection)
   */
  const renderQuestionInput = (question) => {
    const questionId = question.id || question._id;
    const value = answers[questionId];
    const error = validationErrors[questionId];
    const options = question.options || [];

    switch (question.type) {
      case 'short_answer':
        return (
          <Input
            name={`answer-${questionId}`}
            value={value || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Your answer"
            error={error}
          />
        );

      case 'paragraph':
        return (
          <Textarea
            name={`answer-${questionId}`}
            value={value || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Your answer"
            rows={4}
            error={error}
          />
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            name={`answer-${questionId}`}
            options={options.map((opt) => ({ value: opt, label: opt }))}
            value={value || ''}
            onChange={(val) => handleAnswerChange(questionId, val)}
            error={error}
          />
        );

      case 'checkbox':
        return (
          <CheckboxGroup
            name={`answer-${questionId}`}
            options={options.map((opt) => ({ value: opt, label: opt }))}
            value={Array.isArray(value) ? value : []}
            onChange={(val) => handleAnswerChange(questionId, val)}
            error={error}
          />
        );

      case 'dropdown':
        return (
          <Select
            name={`answer-${questionId}`}
            options={options.map((opt) => ({ value: opt, label: opt }))}
            value={value || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Choose an option"
            error={error}
          />
        );

      default:
        return (
          <Input
            name={`answer-${questionId}`}
            value={value || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Your answer"
            error={error}
          />
        );
    }
  };

  // Loading state
  if (isLoading) {
    return <Loader fullScreen text="Loading form..." />;
  }

  // Error state (form not found)
  if (error && !form) {
    return (
      <div className="respond-form-page">
        <div className="respond-form-container">
          <Alert type="error" message={error} />
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Form not published state
  if (form && form.status !== 'published') {
    return (
      <div className="respond-form-page">
        <div className="respond-form-container">
          <div className="form-not-available">
            <h2>Form Not Available</h2>
            <p>This form is not currently accepting responses. It may be in draft mode or closed.</p>
            <Link to="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state (form submitted)
  if (isSubmitted) {
    return (
      <div className="respond-form-page">
        <div className="respond-form-container">
          <div className="submission-success">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Response Submitted!</h2>
            <p className="success-message">
              Thank you for completing "{form?.title}". Your response has been recorded.
            </p>
            <div className="success-actions">
              <Button
                variant="outline"
                onClick={() => {
                  // Reset form for another response
                  setIsSubmitted(false);
                  const resetAnswers = {};
                  questions.forEach((q) => {
                    const questionId = q.id || q._id;
                    resetAnswers[questionId] = q.type === 'checkbox' ? [] : '';
                  });
                  setAnswers(resetAnswers);
                }}
              >
                Submit Another Response
              </Button>
              <Link to="/">
                <Button variant="primary">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="respond-form-page">
      <div className="respond-form-container">
        {/* Form Header */}
        <div className="respond-form-header">
          <h1 className="respond-form-title">{form?.title || 'Untitled Form'}</h1>
          {form?.description && (
            <p className="respond-form-description">{form.description}</p>
          )}
          <p className="respond-form-required-note">
            <span className="required-asterisk">*</span> indicates required question
          </p>
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="respond-form">
          {questions.length === 0 ? (
            <div className="no-questions-message">
              <p>This form has no questions yet.</p>
            </div>
          ) : (
            <div className="questions-container">
              {questions.map((question, index) => {
                const questionId = question.id || question._id;
                
                return (
                  <div 
                    key={questionId} 
                    id={`question-${questionId}`}
                    className={`question-card ${validationErrors[questionId] ? 'has-error' : ''}`}
                  >
                    <div className="question-header">
                      <span className="question-title">
                        {question.title || `Question ${index + 1}`}
                        {(question.is_required || question.required) && (
                          <span className="required-asterisk">*</span>
                        )}
                      </span>
                    </div>
                    <div className="question-input">
                      {renderQuestionInput(question)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Actions */}
          {questions.length > 0 && (
            <div className="respond-form-actions">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Submit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset all answers
                  const resetAnswers = {};
                  questions.forEach((q) => {
                    const questionId = q.id || q._id;
                    resetAnswers[questionId] = q.type === 'checkbox' ? [] : '';
                  });
                  setAnswers(resetAnswers);
                  setValidationErrors({});
                }}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RespondFormPage;
