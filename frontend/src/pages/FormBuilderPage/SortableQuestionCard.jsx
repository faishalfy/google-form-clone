/**
 * SortableQuestionCard Component
 * 
 * LEVEL 4 FEATURE: Drag-and-drop question reordering
 * 
 * Wraps QuestionBuilderCard with @dnd-kit sortable functionality.
 * Provides drag handle and visual feedback during drag.
 * 
 * BEGINNER TIP:
 * - @dnd-kit provides useSortable hook for sortable lists
 * - CSS transform is used for smooth drag animations
 * - The drag handle allows users to initiate drag
 * - Visual feedback (opacity, shadow) indicates drag state
 * 
 * ACCESSIBILITY:
 * - Keyboard navigation supported via @dnd-kit
 * - Screen reader announcements for drag operations
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionBuilderCard from './QuestionBuilderCard';
import './SortableQuestionCard.css';

/**
 * Drag Handle Icon Component
 */
const DragHandle = ({ listeners, attributes }) => (
  <button
    className="drag-handle"
    {...listeners}
    {...attributes}
    title="Drag to reorder"
    aria-label="Drag to reorder question"
  >
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  </button>
);

/**
 * SortableQuestionCard Component
 */
const SortableQuestionCard = ({
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
  isDragDisabled = false,
}) => {
  // Use the sortable hook from dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.tempId || question.id,
    disabled: isDragDisabled,
  });

  // Apply transform styles for drag animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-question-wrapper ${isDragging ? 'is-dragging' : ''}`}
    >
      {/* Drag Handle - Only show if drag is enabled */}
      {!isDragDisabled && (
        <DragHandle listeners={listeners} attributes={attributes} />
      )}
      
      {/* Question Card */}
      <div className="sortable-question-content">
        <QuestionBuilderCard
          question={question}
          index={index}
          error={error}
          isFirst={isFirst}
          isLast={isLast}
          hasSubmissions={hasSubmissions}
          isSaving={isSaving}
          onUpdate={onUpdate}
          onSave={onSave}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      </div>
    </div>
  );
};

export default SortableQuestionCard;
