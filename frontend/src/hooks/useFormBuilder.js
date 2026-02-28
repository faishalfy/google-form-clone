/**
 * useFormBuilder Hook
 * 
 * Custom hook for managing Form Builder state and operations.
 * Handles questions CRUD operations with API integration.
 * 
 * BEGINNER TIP:
 * - Custom hooks encapsulate reusable stateful logic
 * - They start with 'use' prefix by convention
 * - This hook manages all question-related state and API calls
 * - Components using this hook get clean, simple interfaces
 * 
 * Features:
 * - Load questions for a form
 * - Add, update, delete questions
 * - Handle loading and error states
 * - Business constraint handling (submissions exist)
 */

import { useState, useEffect, useCallback } from 'react';
import { questionService, formService } from '../services';

/**
 * Question types supported by the form builder
 */
export const QUESTION_TYPES = [
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
];

/**
 * Check if a question type requires options
 */
export const requiresOptions = (type) => {
  return ['multiple_choice', 'checkbox', 'dropdown'].includes(type);
};

/**
 * Create a new question template
 */
export const createDefaultQuestion = () => ({
  tempId: Date.now(), // Temporary ID for UI tracking
  title: '',
  type: 'short_answer',
  options: [],
  required: false,
  isNew: true, // Flag to identify unsaved questions
});

const useFormBuilder = (formId) => {
  // Form state
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // Loading states
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Error states
  const [error, setError] = useState('');
  const [questionErrors, setQuestionErrors] = useState({});
  
  // Business constraint - if true, type changes and deletes are restricted
  const [hasSubmissions, setHasSubmissions] = useState(false);

  /**
   * Load form details
   */
  const loadForm = useCallback(async () => {
    if (!formId) return;
    
    setIsLoadingForm(true);
    setError('');
    
    try {
      const data = await formService.getFormById(formId);
      const formData = data.form || data;
      setForm(formData);
      
      // Check if form has submissions (affects constraints)
      setHasSubmissions(formData.responseCount > 0 || formData.hasSubmissions);
    } catch (err) {
      setError(err.message || 'Failed to load form');
    } finally {
      setIsLoadingForm(false);
    }
  }, [formId]);

  /**
   * Load questions for the form
   */
  const loadQuestions = useCallback(async () => {
    if (!formId) return;
    
    setIsLoadingQuestions(true);
    
    try {
      const data = await questionService.getQuestions(formId);
      const questionList = data.questions || data || [];
      
      // Add tempId for UI tracking
      const questionsWithIds = questionList.map((q, index) => ({
        ...q,
        tempId: q.id || q._id || Date.now() + index,
        isNew: false,
      }));
      
      setQuestions(questionsWithIds);
    } catch (err) {
      // Don't set error if form loaded but no questions yet
      if (!err.message?.includes('not found')) {
        setError(err.message || 'Failed to load questions');
      }
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [formId]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadForm();
    loadQuestions();
  }, [loadForm, loadQuestions]);

  /**
   * Add a new question (local only until saved)
   */
  const addQuestion = useCallback(() => {
    const newQuestion = createDefaultQuestion();
    setQuestions((prev) => [...prev, newQuestion]);
    return newQuestion;
  }, []);

  /**
   * Update a question locally
   */
  const updateQuestionLocal = useCallback((tempId, updates) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.tempId === tempId ? { ...q, ...updates } : q
      )
    );
    
    // Clear error for this question if it was fixed
    if (questionErrors[tempId]) {
      setQuestionErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[tempId];
        return newErrors;
      });
    }
  }, [questionErrors]);

  /**
   * Save a question to the API
   * Creates new question or updates existing
   */
  const saveQuestion = useCallback(async (tempId) => {
    const question = questions.find((q) => q.tempId === tempId);
    if (!question) return;

    // Validate before saving
    if (!question.title?.trim()) {
      setQuestionErrors((prev) => ({
        ...prev,
        [tempId]: 'Question title is required',
      }));
      return { success: false, error: 'Question title is required' };
    }

    if (requiresOptions(question.type)) {
      const validOptions = (question.options || []).filter((opt) => opt?.trim());
      if (validOptions.length < 2) {
        setQuestionErrors((prev) => ({
          ...prev,
          [tempId]: 'At least 2 options are required',
        }));
        return { success: false, error: 'At least 2 options are required' };
      }
    }

    setIsSaving(true);
    
    try {
      const questionData = {
        title: question.title.trim(),
        type: question.type,
        required: question.required,
        options: requiresOptions(question.type) 
          ? question.options.filter((opt) => opt?.trim()) 
          : [],
      };

      let savedQuestion;
      
      if (question.isNew) {
        // Create new question
        const data = await questionService.createQuestion(formId, questionData);
        savedQuestion = data.question || data;
        
        // Update local state with saved question
        setQuestions((prev) =>
          prev.map((q) =>
            q.tempId === tempId
              ? { ...savedQuestion, tempId: savedQuestion.id || savedQuestion._id, isNew: false }
              : q
          )
        );
      } else {
        // Update existing question
        const questionId = question.id || question._id;
        const data = await questionService.updateQuestion(formId, questionId, questionData);
        savedQuestion = data.question || data;
        
        // Update local state
        setQuestions((prev) =>
          prev.map((q) =>
            q.tempId === tempId ? { ...savedQuestion, tempId, isNew: false } : q
          )
        );
      }

      return { success: true, question: savedQuestion };
    } catch (err) {
      const errorMessage = err.message || 'Failed to save question';
      setQuestionErrors((prev) => ({
        ...prev,
        [tempId]: errorMessage,
      }));
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [formId, questions]);

  /**
   * Delete a question
   */
  const deleteQuestion = useCallback(async (tempId) => {
    const question = questions.find((q) => q.tempId === tempId);
    if (!question) return { success: false, error: 'Question not found' };

    // If it's a new question that hasn't been saved, just remove locally
    if (question.isNew) {
      setQuestions((prev) => prev.filter((q) => q.tempId !== tempId));
      return { success: true };
    }

    // Delete from API
    setIsSaving(true);
    
    try {
      const questionId = question.id || question._id;
      await questionService.deleteQuestion(formId, questionId);
      
      // Remove from local state
      setQuestions((prev) => prev.filter((q) => q.tempId !== tempId));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete question';
      
      // Check for business constraint error
      if (errorMessage.includes('submission') || errorMessage.includes('responses')) {
        setHasSubmissions(true);
      }
      
      setQuestionErrors((prev) => ({
        ...prev,
        [tempId]: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [formId, questions]);

  /**
   * Move question up in order
   */
  const moveQuestionUp = useCallback((tempId) => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.tempId === tempId);
      if (index <= 0) return prev;
      
      const newQuestions = [...prev];
      [newQuestions[index - 1], newQuestions[index]] = 
        [newQuestions[index], newQuestions[index - 1]];
      
      return newQuestions;
    });
  }, []);

  /**
   * Move question down in order
   */
  const moveQuestionDown = useCallback((tempId) => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.tempId === tempId);
      if (index < 0 || index >= prev.length - 1) return prev;
      
      const newQuestions = [...prev];
      [newQuestions[index], newQuestions[index + 1]] = 
        [newQuestions[index + 1], newQuestions[index]];
      
      return newQuestions;
    });
  }, []);

  /**
   * Save question order to API
   */
  const saveQuestionOrder = useCallback(async () => {
    // Filter out unsaved questions
    const savedQuestions = questions.filter((q) => !q.isNew && (q.id || q._id));
    
    if (savedQuestions.length < 2) return { success: true };
    
    setIsSaving(true);
    
    try {
      const orderData = savedQuestions.map((q, index) => ({
        id: q.id || q._id,
        order: index,
      }));
      
      await questionService.reorderQuestions(formId, orderData);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to save question order');
      return { success: false, error: err.message };
    } finally {
      setIsSaving(false);
    }
  }, [formId, questions]);

  /**
   * Refresh data from API
   */
  const refresh = useCallback(() => {
    loadForm();
    loadQuestions();
  }, [loadForm, loadQuestions]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setError('');
    setQuestionErrors({});
  }, []);

  return {
    // State
    form,
    questions,
    hasSubmissions,
    
    // Loading states
    isLoading: isLoadingForm || isLoadingQuestions,
    isLoadingForm,
    isLoadingQuestions,
    isSaving,
    
    // Errors
    error,
    questionErrors,
    
    // Actions
    addQuestion,
    updateQuestionLocal,
    saveQuestion,
    deleteQuestion,
    moveQuestionUp,
    moveQuestionDown,
    saveQuestionOrder,
    refresh,
    clearErrors,
  };
};

export default useFormBuilder;
