/**
 * useDragAndDrop Hook
 * 
 * Wrapper hook for @dnd-kit that simplifies drag-and-drop functionality.
 * Handles reordering of items in a list.
 * 
 * BEGINNER TIP:
 * - Drag and drop allows users to reorder items by dragging
 * - @dnd-kit is a modern, accessible React DnD library
 * - This hook abstracts the complexity for easy reuse
 * 
 * USAGE:
 * const { items, activeId, handleDragStart, handleDragEnd, sensors } = useDragAndDrop({
 *   initialItems: questions,
 *   onReorder: (newOrder) => saveOrder(newOrder),
 * });
 * 
 * SCALABILITY NOTE (10,000+ users):
 * - Virtual rendering should be used for large lists
 * - Optimistic updates provide immediate feedback
 * - Consider implementing batch save for order changes
 */

import { useState, useCallback } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * Drag and drop hook options
 * @typedef {Object} DragDropOptions
 * @property {Array} initialItems - Initial array of items
 * @property {Function} onReorder - Callback when items are reordered
 * @property {string} idKey - Key for item ID (default: 'id')
 */

/**
 * useDragAndDrop hook
 * 
 * @param {DragDropOptions} options - Hook options
 * @returns {Object} - DnD state and handlers
 */
const useDragAndDrop = ({
  initialItems = [],
  onReorder,
  idKey = 'id',
}) => {
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Configure sensors for different input methods
  // PointerSensor: Mouse and touch
  // KeyboardSensor: Keyboard accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a minimum drag distance before starting
      // This prevents accidental drags on click
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveId(active.id);
    setIsDragging(true);
  }, []);

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    setActiveId(null);
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    setItems((currentItems) => {
      const oldIndex = currentItems.findIndex(
        (item) => (item[idKey] || item.tempId) === active.id
      );
      const newIndex = currentItems.findIndex(
        (item) => (item[idKey] || item.tempId) === over.id
      );

      if (oldIndex === -1 || newIndex === -1) {
        return currentItems;
      }

      const newItems = arrayMove(currentItems, oldIndex, newIndex);
      
      // Call onReorder callback with new order
      onReorder?.(newItems);
      
      return newItems;
    });
  }, [idKey, onReorder]);

  /**
   * Handle drag cancel
   */
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setIsDragging(false);
  }, []);

  /**
   * Update items externally
   */
  const updateItems = useCallback((newItems) => {
    setItems(newItems);
  }, []);

  /**
   * Get the currently active item
   */
  const activeItem = activeId
    ? items.find((item) => (item[idKey] || item.tempId) === activeId)
    : null;

  return {
    // State
    items,
    activeId,
    activeItem,
    isDragging,
    
    // Handlers
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    
    // DnD kit sensors
    sensors,
    
    // Actions
    updateItems,
    setItems,
  };
};

export default useDragAndDrop;
