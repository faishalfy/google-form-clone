/**
 * SectionedFormRenderer Component
 * 
 * LEVEL 4 FEATURE: Multi-section form navigation for respondents
 * 
 * Features:
 * - Next/Previous section navigation
 * - Progress indicator (Section X of Y)
 * - Per-section validation before proceeding
 * - Section titles and descriptions
 * - Smooth scroll transitions
 * 
 * BEGINNER TIP:
 * - This component handles section-by-section navigation
 * - Questions are organized into sections for easier completion
 * - Validation happens per-section to catch errors early
 * 
 * USAGE:
 * If sections exist, displays questions section-by-section
 * If no sections, renders all questions on single page
 */

import { useState, useCallback, useEffect } from 'react';
import { Button, Alert } from '../../components/common';
import './SectionedFormRenderer.css';

/**
 * Section Progress Indicator
 */
const SectionProgress = ({ currentSection, totalSections, sections }) => {
  const progressPercent = ((currentSection + 1) / totalSections) * 100;

  return (
    <div className="section-progress">
      <div className="section-progress-text">
        <span className="current-section">
          Section {currentSection + 1} of {totalSections}
        </span>
        {sections[currentSection] && (
          <span className="section-name">{sections[currentSection].title}</span>
        )}
      </div>
      <div className="section-progress-bar">
        <div
          className="section-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="section-dots">
        {sections.map((_, index) => (
          <span
            key={index}
            className={`section-dot ${
              index < currentSection
                ? 'completed'
                : index === currentSection
                ? 'current'
                : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * SectionedFormRenderer Component
 */
const SectionedFormRenderer = ({
  sections = [],
  questions = [],
  answers = {},
  validationErrors = {},
  onAnswerChange,
  onValidate,
  onSubmit,
  renderQuestionInput,
  isSubmitting,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionError, setSectionError] = useState('');

  // Organize questions by section
  const questionsBySection = useCallback(() => {
    if (sections.length === 0) {
      return [{ id: 'default', title: 'Questions', questions }];
    }

    const organized = sections.map((section) => ({
      ...section,
      questions: questions.filter((q) => q.section_id === section.id),
    }));

    // Add any questions without a section to the first section
    const unassignedQuestions = questions.filter(
      (q) => !q.section_id || !sections.find((s) => s.id === q.section_id)
    );

    if (unassignedQuestions.length > 0 && organized.length > 0) {
      organized[0].questions = [
        ...organized[0].questions,
        ...unassignedQuestions,
      ];
    }

    return organized;
  }, [sections, questions]);

  const organizedSections = questionsBySection();
  const currentSection = organizedSections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === organizedSections.length - 1;

  /**
   * Validate current section
   */
  const validateCurrentSection = () => {
    if (!currentSection?.questions) return true;

    const sectionQuestionIds = currentSection.questions.map(
      (q) => q.id || q._id
    );
    const hasErrors = sectionQuestionIds.some(
      (id) => validationErrors[id]
    );

    // Trigger validation for section questions
    if (onValidate) {
      const isValid = onValidate(sectionQuestionIds);
      return isValid;
    }

    return !hasErrors;
  };

  /**
   * Handle next section
   */
  const handleNext = () => {
    setSectionError('');

    // Validate current section first
    if (!validateCurrentSection()) {
      setSectionError('Please complete all required questions in this section.');
      // Scroll to first error
      const firstError = currentSection.questions.find(
        (q) => validationErrors[q.id || q._id]
      );
      if (firstError) {
        const element = document.getElementById(
          `question-${firstError.id || firstError._id}`
        );
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Move to next section
    if (!isLastSection) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle previous section
   */
  const handlePrevious = () => {
    setSectionError('');
    if (!isFirstSection) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle form submission (on last section)
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSectionError('');

    // Validate current section first
    if (!validateCurrentSection()) {
      setSectionError('Please complete all required questions in this section.');
      return;
    }

    // Submit form
    onSubmit(e);
  };

  // If only one "section" (all questions together), don't show section UI
  if (sections.length === 0) {
    return null; // Parent component will render normally
  }

  return (
    <div className="sectioned-form">
      {/* Progress Indicator */}
      <SectionProgress
        currentSection={currentSectionIndex}
        totalSections={organizedSections.length}
        sections={organizedSections}
      />

      {/* Section Header */}
      {currentSection && (
        <div className="section-header-respondent">
          <h2 className="section-title-respondent">{currentSection.title}</h2>
          {currentSection.description && (
            <p className="section-description-respondent">
              {currentSection.description}
            </p>
          )}
        </div>
      )}

      {/* Section Error */}
      {sectionError && (
        <Alert type="error" message={sectionError} />
      )}

      {/* Section Questions */}
      <div className="section-questions">
        {currentSection?.questions.map((question, index) => {
          const questionId = question.id || question._id;

          return (
            <div
              key={questionId}
              id={`question-${questionId}`}
              className={`question-card ${
                validationErrors[questionId] ? 'has-error' : ''
              }`}
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

      {/* Section Navigation */}
      <div className="section-navigation">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstSection || isSubmitting}
        >
          ← Previous
        </Button>

        <span className="section-nav-text">
          {currentSectionIndex + 1} / {organizedSections.length}
        </span>

        {isLastSection ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
};

export default SectionedFormRenderer;
