/**
 * Question Chart Component
 * 
 * Renders appropriate chart visualization based on question type:
 * - multiple_choice → Pie/Doughnut chart
 * - checkbox → Bar chart (horizontal)
 * - dropdown → Pie chart
 * - short_answer → Word cloud / Response list
 * 
 * Uses Recharts library for visualizations.
 * 
 * BEGINNER TIP:
 * - Recharts provides declarative React components
 * - Each chart type has specific data format requirements
 * - ResponsiveContainer makes charts resize automatically
 */

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../components/common';
import './QuestionChart.css';

// Color palette for charts
const COLORS = [
  '#4285f4', // Google Blue
  '#ea4335', // Google Red
  '#fbbc04', // Google Yellow
  '#34a853', // Google Green
  '#ff6d01', // Orange
  '#46bdc6', // Teal
  '#7baaf7', // Light Blue
  '#ee675c', // Light Red
  '#fcc934', // Light Yellow
  '#57bb8a', // Light Green
];

/**
 * Format data for Recharts
 */
const formatChartData = (data, questionType) => {
  if (questionType === 'short_answer') {
    // For short answers, use word frequency
    const wordFreq = data?.wordFrequency || {};
    return Object.entries(wordFreq)
      .map(([word, count]) => ({ name: word, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 words
  }
  
  // For choice questions, format option counts
  return Object.entries(data || {})
    .filter(([key]) => key !== 'responses' && key !== 'wordFrequency')
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Custom tooltip for pie charts
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{data.name}</p>
        <p className="tooltip-value">
          {data.value} responses ({data.payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Pie Chart for multiple choice and dropdown
 */
const PieChartView = ({ data, totalResponses }) => {
  // Add percentage to data
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: totalResponses > 0 
      ? Math.round((item.value / totalResponses) * 100) 
      : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dataWithPercentage}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percentage }) => `${name} (${percentage}%)`}
        >
          {dataWithPercentage.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Bar Chart for checkbox questions
 */
const BarChartView = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip />
        <Bar 
          dataKey="value" 
          fill="#4285f4"
          radius={[0, 4, 4, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Word Frequency Chart for short answers
 */
const WordFrequencyView = ({ data, responses }) => {
  return (
    <div className="word-frequency-view">
      {data.length > 0 && (
        <div className="word-cloud">
          <h4>Top Words</h4>
          <div className="word-tags">
            {data.slice(0, 10).map((item, index) => (
              <span 
                key={index} 
                className="word-tag"
                style={{ 
                  fontSize: `${Math.max(12, Math.min(24, 12 + item.value * 2))}px`,
                  backgroundColor: COLORS[index % COLORS.length] + '20',
                  color: COLORS[index % COLORS.length],
                }}
              >
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="responses-list">
        <h4>All Responses ({responses?.length || 0})</h4>
        <ul className="response-items">
          {(responses || []).slice(0, 10).map((response, index) => (
            <li key={index} className="response-item">
              "{response}"
            </li>
          ))}
          {responses?.length > 10 && (
            <li className="response-more">
              +{responses.length - 10} more responses
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

/**
 * Question Chart Component
 */
const QuestionChart = ({ question, stats }) => {
  // Format chart data
  const chartData = useMemo(() => {
    if (!stats?.data) return [];
    return formatChartData(stats.data, question.type);
  }, [stats, question.type]);

  // Get total responses for this question
  const totalResponses = stats?.totalResponses || 0;

  // Render appropriate chart based on question type
  const renderChart = () => {
    if (totalResponses === 0) {
      return (
        <div className="no-responses">
          <p>No responses for this question yet</p>
        </div>
      );
    }

    switch (question.type) {
      case 'multiple_choice':
      case 'dropdown':
        return <PieChartView data={chartData} totalResponses={totalResponses} />;
      
      case 'checkbox':
        return <BarChartView data={chartData} />;
      
      case 'short_answer':
        return (
          <WordFrequencyView 
            data={chartData} 
            responses={stats?.data?.responses} 
          />
        );
      
      default:
        return <p>Unsupported question type: {question.type}</p>;
    }
  };

  // Get question type label
  const getTypeLabel = () => {
    const labels = {
      multiple_choice: 'Multiple Choice',
      checkbox: 'Checkboxes',
      dropdown: 'Dropdown',
      short_answer: 'Short Answer',
    };
    return labels[question.type] || question.type;
  };

  return (
    <Card className="question-chart-card">
      <div className="question-chart-header">
        <h3 className="question-title">
          {question.title}
          {question.is_required && <span className="required-badge">*</span>}
        </h3>
        <div className="question-meta">
          <span className="question-type">{getTypeLabel()}</span>
          <span className="response-count">
            {totalResponses} response{totalResponses !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="question-chart-body">
        {renderChart()}
      </div>
    </Card>
  );
};

export default QuestionChart;
