/**
 * Submissions List Component
 * 
 * Displays a list of all submissions with the ability to view details.
 * 
 * Features:
 * - Paginated list of submissions
 * - Click to view submission detail
 * - Modal/sidebar for submission answers
 * - Search and filter capabilities
 * 
 * BEGINNER TIP:
 * - This is the "List View" alternative to charts
 * - Good for reviewing individual responses
 * - Shows respondent info if available
 */

import { useState } from 'react';
import { Card, Button, Modal } from '../../components/common';
import { submissionService } from '../../services';
import './SubmissionsList.css';

/**
 * Format date for display
 */
const formatDate = (dateString) => {
  return submissionService.formatSubmissionDate(dateString);
};

/**
 * Submission Detail Modal
 */
const SubmissionDetailModal = ({ submission, questions, onClose }) => {
  if (!submission) return null;

  // Create a map of questions for easy lookup
  const questionMap = new Map(questions.map(q => [q.id, q]));

  return (
    <Modal
      isOpen={!!submission}
      onClose={onClose}
      title="Submission Detail"
      size="large"
    >
      <div className="submission-detail">
        {/* Submission Info */}
        <div className="submission-info">
          <div className="info-item">
            <span className="info-label">Submitted:</span>
            <span className="info-value">{formatDate(submission.submitted_at)}</span>
          </div>
          {submission.respondent && (
            <>
              {submission.respondent.name && (
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{submission.respondent.name}</span>
                </div>
              )}
              {submission.respondent.email && (
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{submission.respondent.email}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Answers */}
        <div className="submission-answers">
          <h4>Responses</h4>
          {(submission.answers || []).map((answer, index) => {
            const question = questionMap.get(answer.question_id) || {};
            return (
              <div key={index} className="answer-item">
                <div className="answer-question">
                  {answer.question_title || question.title || 'Question'}
                  {question.is_required && <span className="required">*</span>}
                </div>
                <div className="answer-value">
                  {Array.isArray(answer.value) 
                    ? answer.value.join(', ') 
                    : answer.value || <em className="no-answer">No answer</em>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

/**
 * Submissions List Component
 */
const SubmissionsList = ({ 
  submissions, 
  questions, 
  onViewDetail, 
  selectedSubmission,
  onCloseDetail 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = submissions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="submissions-list">
      <Card className="list-card">
        <div className="list-header">
          <h3>All Submissions</h3>
          <span className="submission-count">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, submissions.length)} of {submissions.length}
          </span>
        </div>

        <div className="list-table-wrapper">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Submitted</th>
                <th>Respondent</th>
                <th>Answers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((submission, index) => (
                <tr key={submission.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{formatDate(submission.submitted_at)}</td>
                  <td>
                    {submission.respondent ? (
                      <span>
                        {submission.respondent.name || submission.respondent.email || 'Logged-in User'}
                      </span>
                    ) : (
                      <em className="anonymous">Anonymous</em>
                    )}
                  </td>
                  <td>
                    {submission.answers?.length || 0} answer{submission.answers?.length !== 1 ? 's' : ''}
                  </td>
                  <td>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => onViewDetail(submission.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="list-pagination">
            <Button
              variant="outline"
              size="small"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="small"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        questions={questions}
        onClose={onCloseDetail}
      />
    </div>
  );
};

export default SubmissionsList;
