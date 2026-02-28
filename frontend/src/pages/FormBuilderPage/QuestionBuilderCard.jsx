/**
 * QuestionBuilderCard Component
 * 
 * Individual question card for the form builder.
 * Handles editing question properties, options, and actions.
 * 
 * BEGINNER TIP:
 * - This is a controlled component - state is managed by parent
 * - Uses composition: relies on common components for inputs
 * - Handles dynamic form fields based on question type
 */

import { useState } from 'react';
import { Input, Select, Button, Checkbox, Alert } from '../../components/common';
import { QUESTION_TYPES, requiresOptions } from '../../hooks';
import './QuestionBuilderCard.css';

const QuestionBuilderCard = ({
  question,
  index,
  error,
  isFirst,
  isLast,
  hasSubmissions,
  isSaving,
  onUpdate,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  // Track if question has been modified
  const [isModified, setIsModified] = useState(question.isNew);

  /**
   * Handle field change
   */
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
    setIsModified(true);
  };

  /**
   * Handle question type change
   * Resets options if switching to/from option-based type
   */
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const updates = { type: newType };
    
    // Initialize options array if switching to option-based type
    if (requiresOptions(newType) && !requiresOptions(question.type)) {
      updates.options = ['', ''];
    }
    
    // Clear options if switching away from option-based type
    if (!requiresOptions(newType) && requiresOptions(question.type)) {
      updates.options = [];
    }
    
    onUpdate(updates);
    setIsModified(true);
  };

  /**
   * Handle option change
   */
  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
    setIsModified(true);
  };

  /**
   * Add new option
   */
  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    onUpdate({ options: newOptions });
    setIsModified(true);
  };

  /**
   * Remove option
   */
  const removeOption = (optionIndex) => {
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    onUpdate({ options: newOptions });
    setIsModified(true);
  };

  /**
   * Handle save click
   */
  const handleSave = async () => {
    await onSave();
    setIsModified(false);
  };

  // Determine if type change is disabled
  const isTypeChangeDisabled = hasSubmissions && !question.isNew;

  return (
    <div className={`question-builder-card ${question.isNew ? 'is-new' : ''} ${isModified ? 'is-modified' : ''}`}>
      {/* Card Header */}
      <div className="question-builder-header">
        <span className="question-number">
          Question {index + 1}
          {question.required && <span className="required-badge">Required</span>}
          {question.isNew && <span className="new-badge">New</span>}
          {isModified && !question.isNew && <span className="modified-badge">Modified</span>}
        </span>
        
        <div className="question-builder-actions">
          <button
            type="button"
            className="action-btn"
            onClick={onMoveUp}
            disabled={isFirst || isSaving}
            title="Move up"
            aria-label="Move question up"
          >
            ↑
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={onMoveDown}
            disabled={isLast || isSaving}
            title="Move down"
            aria-label="Move question down"
          >
            ↓
          </button>
          <button
            type="button"
            className="action-btn delete-btn"
            onClick={onDelete}
            disabled={hasSubmissions || isSaving}
            title={hasSubmissions ? 'Cannot delete: form has submissions' : 'Delete question'}
            aria-label="Delete question"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Card Body */}
      <div className="question-builder-body">
        {/* Question Title */}
        <Input
          label="Question Title"
          name={`question-title-${index}`}
          value={question.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter your question"
          required
        />

        {/* Question Type */}
        <Select
          label="Question Type"
          name={`question-type-${index}`}
          value={question.type || 'short_answer'}
          onChange={handleTypeChange}
          options={QUESTION_TYPES}
          disabled={isTypeChangeDisabled}
          helperText={isTypeChangeDisabled ? 'Cannot change type: form has submissions' : ''}
        />

        {/* Options for choice-based questions */}
        {requiresOptions(question.type) && (
          <div className="question-options-section">
            <label className="options-label">
              Options
              <span className="options-hint">(minimum 2 required)</span>
            </label>
            
            <div className="options-list">
              {(question.options || []).map((option, optIndex) => (
                <div key={optIndex} className="option-row">
                  <span className="option-indicator">
                    {question.type === 'multiple_choice' && '○'}
                    {question.type === 'checkbox' && '☐'}
                    {question.type === 'dropdown' && `${optIndex + 1}.`}
                  </span>
                  <Input
                    name={`option-${index}-${optIndex}`}
                    value={option}
                    onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                  />
                  <button
                    type="button"
                    className="remove-option-btn"
                    onClick={() => removeOption(optIndex)}
                    disabled={question.options.length <= 2}
                    title="Remove option"
                    aria-label={`Remove option ${optIndex + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="small"
              onClick={addOption}
            >
              + Add Option
            </Button>
          </div>
        )}

        {/* Required Toggle */}
        <div className="question-required-section">
          <Checkbox
            name={`question-required-${index}`}
            label="Required question"
            checked={question.required || false}
            onChange={(e) => handleChange('required', e.target.checked)}
          />
        </div>
      </div>

      {/* Card Footer */}
      <div className="question-builder-footer">
        <Button
          variant="primary"
          size="small"
          onClick={handleSave}
          loading={isSaving}
          disabled={!isModified && !question.isNew}
        >
          {question.isNew ? 'Create Question' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionBuilderCard;
