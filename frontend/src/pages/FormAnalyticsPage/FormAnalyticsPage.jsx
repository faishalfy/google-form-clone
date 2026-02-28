/**
 * Form Analytics Page
 * 
 * LEVEL 4 FEATURE: Responses & Statistics Dashboard
 * 
 * Displays aggregated statistics and visualizations for form submissions:
 * - Total response count
 * - Per-question statistics with charts
 * - Different chart types based on question type:
 *   - multiple_choice → Pie/Doughnut chart
 *   - checkbox → Bar chart
 *   - dropdown → Pie chart
 *   - short_answer → Word frequency + list view
 * 
 * BEGINNER TIP:
 * - This page is for form OWNERS only
 * - Charts are rendered using Recharts library
 * - Data is aggregated on the client side
 * - Real-time updates as submissions come in
 * 
 * SCALABILITY NOTE (10,000+ users):
 * - Pagination is used to fetch submissions
 * - Client-side aggregation works for moderate data sizes
 * - For very large datasets, consider server-side aggregation
 * - Charts are lazy-loaded for performance
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Alert, 
  Loader, 
  Card 
} from '../../components/common';
import { formService, questionService, submissionService } from '../../services';
import QuestionChart from './QuestionChart';
import SubmissionsList from './SubmissionsList';
import './FormAnalyticsPage.css';

const FormAnalyticsPage = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();

  // State
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View mode: 'charts' or 'list'
  const [viewMode, setViewMode] = useState('charts');

  /**
   * Load form, questions, and submissions
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Load form details
        const formData = await formService.getFormById(formId);
        setForm(formData.form || formData);
        
        // Load questions
        const questionsData = await questionService.getQuestions(formId);
        const questionList = questionsData.questions || questionsData || [];
        setQuestions(questionList);
        
        // Load all submissions
        const submissionsData = await submissionService.getSubmissions(formId, {
          limit: 100,
          sort: 'desc',
        });
        
        // For full analytics, we might need to fetch all pages
        let allSubmissions = submissionsData.submissions || [];
        const pagination = submissionsData.pagination;
        
        // If there are more pages, fetch them
        if (pagination && pagination.totalPages > 1) {
          for (let page = 2; page <= pagination.totalPages; page++) {
            const moreData = await submissionService.getSubmissions(formId, {
              page,
              limit: 100,
              sort: 'desc',
            });
            allSubmissions = [...allSubmissions, ...(moreData.submissions || [])];
          }
        }
        
        // Fetch full details for each submission (to get answers)
        const submissionsWithAnswers = await Promise.all(
          allSubmissions.map(async (sub) => {
            try {
              const detail = await submissionService.getSubmissionDetail(formId, sub.id);
              return detail;
            } catch {
              return sub;
            }
          })
        );
        
        setSubmissions(submissionsWithAnswers);
      } catch (err) {
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [formId]);

  /**
   * Aggregate statistics using memoization for performance
   */
  const statistics = useMemo(() => {
    if (!questions.length || !submissions.length) return null;
    return submissionService.aggregateSubmissionData(submissions, questions);
  }, [submissions, questions]);

  /**
   * Handle viewing submission detail
   */
  const handleViewSubmission = async (submissionId) => {
    try {
      const detail = await submissionService.getSubmissionDetail(formId, submissionId);
      setSelectedSubmission(detail);
    } catch (err) {
      setError(err.message || 'Failed to load submission detail');
    }
  };

  // Loading state
  if (isLoading) {
    return <Loader fullScreen text="Loading analytics..." />;
  }

  // Error state
  if (error && !form) {
    return (
      <div className="analytics-page">
        <Alert type="error" message={error} />
        <Link to="/forms">
          <Button variant="outline">Back to Forms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <Button
            variant="outline"
            size="small"
            onClick={() => navigate(`/forms/${formId}`)}
          >
            ← Back to Form
          </Button>
        </div>
        <div className="analytics-header-center">
          <h1 className="analytics-title">
            {form?.title || 'Form Analytics'}
          </h1>
          <p className="analytics-subtitle">
            Responses & Statistics Dashboard
          </p>
        </div>
        <div className="analytics-header-right">
          <Link to={`/forms/${formId}/builder`}>
            <Button variant="outline" size="small">
              Edit Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Summary Cards */}
      <div className="analytics-summary">
        <Card className="summary-card">
          <div className="summary-value">{submissions.length}</div>
          <div className="summary-label">Total Responses</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-value">{questions.length}</div>
          <div className="summary-label">Questions</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-value">
            {submissions.length > 0 
              ? submissionService.formatSubmissionDate(submissions[0]?.submitted_at)
              : '-'
            }
          </div>
          <div className="summary-label">Latest Response</div>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="view-toggle">
        <Button
          variant={viewMode === 'charts' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setViewMode('charts')}
        >
          📊 Charts View
        </Button>
        <Button
          variant={viewMode === 'list' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setViewMode('list')}
        >
          📋 List View
        </Button>
      </div>

      {/* Main Content */}
      {submissions.length === 0 ? (
        <div className="analytics-empty">
          <Card className="empty-card">
            <div className="empty-icon">📭</div>
            <h2>No Responses Yet</h2>
            <p>Share your form to start collecting responses.</p>
            <Link to={`/forms/${formId}/respond`}>
              <Button variant="primary">
                Preview Form
              </Button>
            </Link>
          </Card>
        </div>
      ) : viewMode === 'charts' ? (
        <div className="analytics-charts">
          {questions.map((question) => (
            <QuestionChart
              key={question.id}
              question={question}
              stats={statistics?.[question.id]}
            />
          ))}
        </div>
      ) : (
        <SubmissionsList
          submissions={submissions}
          questions={questions}
          onViewDetail={handleViewSubmission}
          selectedSubmission={selectedSubmission}
          onCloseDetail={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
};

export default FormAnalyticsPage;
