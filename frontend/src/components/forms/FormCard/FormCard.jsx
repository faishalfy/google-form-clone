/**
 * FormCard Component
 * 
 * Displays a single form in a card format.
 * Used in the form list page.
 */

import { Link } from 'react-router-dom';
import { Card, Button } from '../../common';
import './FormCard.css';

const FormCard = ({ form, onDelete }) => {
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="form-card">
      <div className="form-card-header">
        <h3 className="form-card-title">{form.title}</h3>
        <span className="form-card-date">
          {formatDate(form.createdAt || form.created_at)}
        </span>
      </div>

      <p className="form-card-description">
        {form.description || 'No description'}
      </p>

      <div className="form-card-meta">
        <span className="form-card-status" data-status={form.status || 'draft'}>
          {form.status === 'published' ? '✅ Published' : form.status === 'closed' ? '🔒 Closed' : '📝 Draft'}
        </span>
        <span className="form-card-questions">
          {form.question_count ?? form.questions?.length ?? 0} question(s)
        </span>
      </div>

      <div className="form-card-actions">
        <Link to={`/forms/${form._id || form.id}`}>
          <Button variant="outline" size="small">
            View
          </Button>
        </Link>
        <Link to={`/forms/${form._id || form.id}/edit`}>
          <Button variant="secondary" size="small">
            Edit
          </Button>
        </Link>
        <Button
          variant="danger"
          size="small"
          onClick={() => onDelete(form._id || form.id)}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default FormCard;
