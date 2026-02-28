/**
 * QuestionPreview Component
 * 
 * Displays a question in read-only preview mode.
 * Used in the form detail/preview page.
 * 
 * Supports question types:
 * - short_answer (or text): Single line text input
 * - paragraph: Multi-line text input
 * - multiple_choice: Radio buttons
 * - checkbox: Checkbox group
 * - dropdown: Select dropdown
 */

import './QuestionPreview.css';

const QuestionPreview = ({ question, index }) => {
  /**
   * Render input based on question type
   */
  const renderInput = () => {
    switch (question.type) {
      case 'short_answer':
      case 'text':
        return (
          <input
            type="text"
            className="preview-input"
            placeholder="Short answer text"
            disabled
          />
        );

      case 'paragraph':
        return (
          <textarea
            className="preview-textarea"
            placeholder="Long answer text"
            rows={3}
            disabled
          />
        );

      case 'multiple_choice':
        return (
          <div className="preview-options">
            {(question.options || []).map((option, i) => (
              <label key={i} className="preview-option">
                <input type="radio" name={`q-${index}`} disabled />
                <span>{option || `Option ${i + 1}`}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="preview-options">
            {(question.options || []).map((option, i) => (
              <label key={i} className="preview-option">
                <input type="checkbox" disabled />
                <span>{option || `Option ${i + 1}`}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select className="preview-select" disabled>
            <option value="">Choose</option>
            {(question.options || []).map((option, i) => (
              <option key={i} value={option}>
                {option || `Option ${i + 1}`}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            className="preview-input"
            placeholder="Answer"
            disabled
          />
        );
    }
  };

  // Get question text - support both 'title' and 'questionText' properties
  const questionText = question.title || question.questionText || 'Untitled Question';

  return (
    <div className="question-preview">
      <div className="question-preview-header">
        <span className="question-preview-text">
          {questionText}
          {question.required && <span className="required-indicator">*</span>}
        </span>
      </div>
      <div className="question-preview-body">{renderInput()}</div>
    </div>
  );
};

export default QuestionPreview;
