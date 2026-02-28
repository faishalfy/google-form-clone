/**
 * SectionEditor Component
 * 
 * LEVEL 4 FEATURE: Multi-section form management
 * 
 * Allows creating and editing form sections:
 * - Add new sections
 * - Edit section titles and descriptions
 * - Delete sections (moves questions to default section)
 * - Reorder sections
 * 
 * BEGINNER TIP:
 * - Sections help organize forms with many questions
 * - Think of them as "pages" in a multi-page form
 * - Questions belong to exactly one section
 */

import { useState } from 'react';
import { Button, Input, Textarea, Modal } from '../../components/common';
import './SectionEditor.css';

/**
 * SectionEditor Component
 */
const SectionEditor = ({
  sections,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onReorderSection,
  isLoading,
}) => {
  const [editingSection, setEditingSection] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSection, setNewSection] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});

  /**
   * Handle add section
   */
  const handleAddSection = async () => {
    // Validate
    if (!newSection.title.trim()) {
      setErrors({ title: 'Section title is required' });
      return;
    }

    await onAddSection({
      title: newSection.title.trim(),
      description: newSection.description.trim(),
      order_index: sections.length,
    });

    // Reset
    setNewSection({ title: '', description: '' });
    setShowAddModal(false);
    setErrors({});
  };

  /**
   * Handle update section
   */
  const handleUpdateSection = async () => {
    if (!editingSection) return;

    // Validate
    if (!editingSection.title.trim()) {
      setErrors({ title: 'Section title is required' });
      return;
    }

    await onUpdateSection(editingSection.id, {
      title: editingSection.title.trim(),
      description: editingSection.description?.trim() || '',
    });

    setEditingSection(null);
    setErrors({});
  };

  /**
   * Handle delete section
   */
  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section? Questions will be moved to the default section.')) {
      await onDeleteSection(sectionId);
    }
  };

  /**
   * Move section up
   */
  const handleMoveUp = (index) => {
    if (index > 0 && onReorderSection) {
      onReorderSection(index, index - 1);
    }
  };

  /**
   * Move section down
   */
  const handleMoveDown = (index) => {
    if (index < sections.length - 1 && onReorderSection) {
      onReorderSection(index, index + 1);
    }
  };

  return (
    <div className="section-editor">
      <div className="section-editor-header">
        <h3 className="section-editor-title">Form Sections</h3>
        <Button
          variant="outline"
          size="small"
          onClick={() => setShowAddModal(true)}
          disabled={isLoading}
        >
          + Add Section
        </Button>
      </div>

      {/* Sections List */}
      <div className="sections-list">
        {sections.length === 0 ? (
          <div className="sections-empty">
            <p>No sections yet. All questions will appear on one page.</p>
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowAddModal(true)}
            >
              Create First Section
            </Button>
          </div>
        ) : (
          sections.map((section, index) => (
            <div key={section.id} className="section-item">
              {editingSection?.id === section.id ? (
                /* Edit Mode */
                <div className="section-edit-form">
                  <Input
                    value={editingSection.title}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        title: e.target.value,
                      })
                    }
                    placeholder="Section title"
                    error={errors.title}
                  />
                  <Textarea
                    value={editingSection.description || ''}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        description: e.target.value,
                      })
                    }
                    placeholder="Section description (optional)"
                    rows={2}
                  />
                  <div className="section-edit-actions">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleUpdateSection}
                      disabled={isLoading}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => {
                        setEditingSection(null);
                        setErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div className="section-info">
                    <span className="section-number">{index + 1}</span>
                    <div className="section-content">
                      <h4 className="section-title">{section.title}</h4>
                      {section.description && (
                        <p className="section-description">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="section-actions">
                    <button
                      className="section-action-btn"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="section-action-btn"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sections.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="section-action-btn"
                      onClick={() => setEditingSection({ ...section })}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="section-action-btn danger"
                      onClick={() => handleDeleteSection(section.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Section Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewSection({ title: '', description: '' });
          setErrors({});
        }}
        title="Add New Section"
      >
        <div className="add-section-form">
          <Input
            label="Section Title"
            value={newSection.title}
            onChange={(e) =>
              setNewSection({ ...newSection, title: e.target.value })
            }
            placeholder="Enter section title"
            error={errors.title}
          />
          <Textarea
            label="Description (optional)"
            value={newSection.description}
            onChange={(e) =>
              setNewSection({ ...newSection, description: e.target.value })
            }
            placeholder="Brief description of this section"
            rows={3}
          />
          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setNewSection({ title: '', description: '' });
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSection}
              disabled={isLoading}
            >
              Add Section
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SectionEditor;
