# Frontend Level 3 - Form Builder & Respondent View

This document explains the Level 3 upgrade to the Google Form Clone frontend, including the Form Builder and Respondent View features.

## 📁 Updated Folder Structure

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Button/           # Reusable button component
│   │   ├── Input/            # Text input component
│   │   ├── Textarea/         # Multi-line text input
│   │   ├── Select/           # Dropdown select (NEW)
│   │   ├── Checkbox/         # Single checkbox (NEW)
│   │   ├── CheckboxGroup/    # Multiple checkbox group (NEW)
│   │   ├── RadioGroup/       # Radio button group (NEW)
│   │   ├── Modal/            # Base modal component
│   │   ├── ConfirmModal/     # Confirmation dialog (NEW)
│   │   ├── Alert/            # Alert messages
│   │   ├── Loader/           # Loading spinner
│   │   └── Card/             # Card container
│   ├── forms/
│   │   ├── FormCard/         # Form card for list view
│   │   ├── QuestionEditor/   # Question editing in old flow
│   │   └── QuestionPreview/  # Question preview (read-only)
│   └── layout/
│       ├── Navbar/           # Navigation bar
│       └── Footer/           # Page footer
├── hooks/
│   ├── index.js              # Hook exports
│   └── useFormBuilder.js     # Form builder state management (NEW)
├── pages/
│   ├── HomePage/             # Landing page
│   ├── LoginPage/            # Authentication
│   ├── RegisterPage/         # User registration
│   ├── FormListPage/         # User's forms list
│   ├── FormDetailPage/       # Form preview (UPDATED)
│   ├── CreateFormPage/       # Create new form
│   ├── EditFormPage/         # Edit form details
│   ├── FormBuilderPage/      # Question management (NEW)
│   ├── RespondFormPage/      # Fill and submit form (NEW)
│   └── NotFoundPage/         # 404 page
├── services/
│   ├── api.js                # Axios instance
│   ├── authService.js        # Authentication API
│   ├── formService.js        # Forms CRUD API
│   ├── questionService.js    # Questions CRUD API (NEW)
│   └── responseService.js    # Form submission API (NEW)
├── context/
│   └── AuthContext.jsx       # Authentication state
└── config/
    └── index.js              # App configuration
```

## 🔀 Route Structure

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | HomePage | Public | Landing page |
| `/login` | LoginPage | Public | User login |
| `/register` | RegisterPage | Public | User registration |
| `/forms` | FormListPage | Protected | User's forms list |
| `/forms/create` | CreateFormPage | Protected | Create new form |
| `/forms/:id` | FormDetailPage | Protected | Form preview |
| `/forms/:id/edit` | EditFormPage | Protected | Edit form details |
| `/forms/:id/builder` | FormBuilderPage | Protected | Manage questions |
| `/forms/:id/respond` | RespondFormPage | Public | Fill and submit form |

## 🏗️ New Features Explained

### 1. Form Builder (FormBuilderPage)

The Form Builder allows authenticated users to manage questions for their forms.

**Features:**
- View all questions for a form
- Add new questions
- Edit existing questions
- Delete questions (with confirmation)
- Set questions as required
- Manage options for choice-based questions
- Reorder questions (move up/down)

**Business Constraint:**
If a form already has submissions, you cannot:
- Delete questions
- Change question type

**Question Types Supported:**
| Type | Input Component | Description |
|------|-----------------|-------------|
| `short_answer` | Text Input | Single line text response |
| `multiple_choice` | Radio Group | Single selection from options |
| `checkbox` | Checkbox Group | Multiple selections allowed |
| `dropdown` | Select | Single selection from dropdown |

### 2. Respondent View (RespondFormPage)

The Respondent View allows anyone (authenticated or not) to fill out and submit forms.

**Features:**
- Fetches form details and questions
- Renders dynamic inputs based on question type
- Validates required fields
- Submits answers to backend
- Shows success/error messages
- Option to submit another response

### 3. Custom Hook (useFormBuilder)

The `useFormBuilder` hook encapsulates all form builder state and logic.

**Usage:**
```jsx
import { useFormBuilder } from '../../hooks';

const MyComponent = () => {
  const {
    form,
    questions,
    isLoading,
    error,
    addQuestion,
    updateQuestionLocal,
    saveQuestion,
    deleteQuestion,
  } = useFormBuilder(formId);
  
  // Use the state and actions...
};
```

**Returns:**
- `form` - Form details object
- `questions` - Array of questions
- `hasSubmissions` - Boolean indicating if form has responses
- `isLoading` - Loading state
- `error` - Error message
- `questionErrors` - Per-question errors
- `addQuestion()` - Add new question
- `updateQuestionLocal()` - Update question locally
- `saveQuestion()` - Save question to API
- `deleteQuestion()` - Delete question
- `moveQuestionUp()` - Move question up
- `moveQuestionDown()` - Move question down

## 🔄 Dynamic Question Rendering

The system uses a switch statement to render different input components based on question type:

```jsx
const renderQuestionInput = (question) => {
  switch (question.type) {
    case 'short_answer':
      return <Input ... />;
    
    case 'multiple_choice':
      return <RadioGroup ... />;
    
    case 'checkbox':
      return <CheckboxGroup ... />;
    
    case 'dropdown':
      return <Select ... />;
    
    default:
      return <Input ... />;
  }
};
```

## ✅ Validation Approach

### Client-Side Validation

1. **Form Builder Validation:**
   - Question title is required
   - Choice-based questions need at least 2 options
   - Validation occurs before API save

2. **Response Form Validation:**
   - Required questions must have answers
   - Checkbox questions: at least one selection
   - Other questions: non-empty value

### Server-Side Validation

The backend validates:
- Data types and formats
- Business constraints (submissions exist)
- User authorization

## 🔌 API Integration Examples

### Creating a Question

```javascript
import { questionService } from '../services';

const createQuestion = async () => {
  try {
    const result = await questionService.createQuestion(formId, {
      title: 'What is your name?',
      type: 'short_answer',
      required: true,
      options: [],
    });
    console.log('Created:', result.question);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Submitting a Form Response

```javascript
import { responseService } from '../services';

const submitForm = async () => {
  try {
    await responseService.submitResponse(formId, {
      answers: [
        { questionId: 'q1', value: 'John Doe' },
        { questionId: 'q2', value: ['Option A', 'Option B'] },
      ],
    });
    console.log('Submitted successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

## 📱 Responsive Design

All new components are fully responsive:
- Desktop: Full layout with side-by-side elements
- Tablet: Adjusted spacing and font sizes
- Mobile: Stacked layout with full-width buttons

## 🔒 Security Considerations

1. **Protected Routes:** Form builder requires authentication
2. **Token Handling:** JWT stored in localStorage, sent via Authorization header
3. **API Errors:** 401 responses redirect to login
4. **Input Sanitization:** Done on backend

## 📈 Scalability Notes (10,000+ Users)

1. **API Design:**
   - Questions loaded via paginated API
   - Individual question saves (not batch)
   - Consider implementing auto-save with debouncing

2. **State Management:**
   - Local state for form builder (per-component)
   - Consider Redux/Zustand for larger scale

3. **Performance:**
   - Memoized callbacks in hooks
   - Lazy loading for routes
   - Consider virtualization for long question lists

4. **Backend Considerations:**
   - Implement rate limiting
   - Add caching for frequently accessed forms
   - Database indexing on formId

## 🚀 Quick Start

1. Make sure backend is running on `http://localhost:5000`

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Test the features:
   - Create a new form at `/forms/create`
   - Navigate to Form Builder at `/forms/:id/builder`
   - Add questions with different types
   - Share the respond link `/forms/:id/respond`
   - Submit a test response

## 📝 Component Props Reference

### Select Component
```jsx
<Select
  label="Question Type"
  name="questionType"
  options={[{ value: 'short_answer', label: 'Short Answer' }]}
  value={selectedValue}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Select an option"
  required
  error={errorMessage}
/>
```

### RadioGroup Component
```jsx
<RadioGroup
  label="Choose one"
  name="myRadio"
  options={['Option A', 'Option B', 'Option C']}
  value={selectedOption}
  onChange={(value) => setSelectedOption(value)}
  required
  error={errorMessage}
/>
```

### CheckboxGroup Component
```jsx
<CheckboxGroup
  label="Select multiple"
  name="myCheckbox"
  options={['Item 1', 'Item 2', 'Item 3']}
  value={selectedItems}  // Array
  onChange={(values) => setSelectedItems(values)}
  required
  error={errorMessage}
/>
```

### ConfirmModal Component
```jsx
<ConfirmModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onConfirm={handleDelete}
  title="Delete Question"
  message="Are you sure?"
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  isLoading={isDeleting}
/>
```
