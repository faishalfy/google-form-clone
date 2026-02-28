/**
 * QuestionEditor Component
 * 
 * Allows users to create and edit questions in a form.
 * Supports different question types: text, paragraph, multiple choice, checkbox, dropdown.
 */

import { useState } from 'react';
import { Input, Textarea, Button } from '../../common';
import './QuestionEditor.css';

// Available question types
const QUESTION_TYPES = [
  { value: 'text', label: 'Short Answer' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
];

const QuestionEditor = ({
  question,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  /**
   * Handle changes to question fields
   */
  const handleChange = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  /**
   * Handle option changes for multiple choice/checkbox/dropdown
   */
  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    onUpdate({ ...question, options: newOptions });
  };

  /**
   * Add a new option
   */
  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    onUpdate({ ...question, options: newOptions });
  };

  /**
   * Remove an option
   */
  const removeOption = (optionIndex) => {
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    onUpdate({ ...question, options: newOptions });
  };

  // Check if question type requires options
  const requiresOptions = ['multiple_choice', 'checkbox', 'dropdown'].includes(
    question.type
  );

  return (
    <div className="question-editor">
      <div className="question-editor-header">
        <span className="question-number">Question {index + 1}</span>
        <div className="question-editor-actions">
          <button
            type="button"
            className="question-action-btn"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            className="question-action-btn"
            onClick={onMoveDown}
            disabled={isLast}
            title="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            className="question-action-btn question-delete-btn"
            onClick={onDelete}
            title="Delete question"
          >
            ×
          </button>
        </div>
      </div>

      <div className="question-editor-body">
        {/* Question Text */}
        <Input
          label="Question"
          name={`question-${index}`}
          value={question.questionText || ''}
          onChange={(e) => handleChange('questionText', e.target.value)}
          placeholder="Enter your question"
          required
        />

        {/* Question Type */}
        <div className="input-group">
          <label className="input-label">Question Type</label>
          <select
            className="input-field"
            value={question.type || 'text'}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Options for multiple choice, checkbox, dropdown */}
        {requiresOptions && (
          <div className="question-options">
            <label className="input-label">Options</label>
            {(question.options || []).map((option, optIndex) => (
              <div key={optIndex} className="question-option-row">
                <Input
                  name={`option-${index}-${optIndex}`}
                  value={option}
                  onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                  placeholder={`Option ${optIndex + 1}`}
                />
                <button
                  type="button"
                  className="option-remove-btn"
                  onClick={() => removeOption(optIndex)}
                >
                  ×
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={addOption}
            >
              + Add Option
            </Button>
          </div>
        )}

        {/* Required toggle */}
        <label className="question-required-toggle">
          <input
            type="checkbox"
            checked={question.required || false}
            onChange={(e) => handleChange('required', e.target.checked)}
          />
          <span>Required</span>
        </label>
      </div>
    </div>
  );
};

export default QuestionEditor;
