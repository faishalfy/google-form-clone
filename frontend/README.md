# Google Form Clone - Frontend

A modern React application for creating and managing forms, similar to Google Forms. Built with React 19, Vite, and React Router.

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable components
│   │   ├── auth/            # Authentication components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── common/          # Shared UI components
│   │   │   ├── Alert/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   ├── Loader/
│   │   │   ├── Modal/
│   │   │   └── Textarea/
│   │   ├── forms/           # Form-specific components
│   │   │   ├── FormCard/
│   │   │   ├── QuestionEditor/
│   │   │   └── QuestionPreview/
│   │   └── layout/          # Layout components
│   │       ├── Footer/
│   │       └── Navbar/
│   ├── config/              # App configuration
│   │   └── index.js
│   ├── context/             # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/               # Page components
│   │   ├── CreateFormPage/
│   │   ├── EditFormPage/
│   │   ├── FormDetailPage/
│   │   ├── FormListPage/
│   │   ├── HomePage/
│   │   ├── LoginPage/
│   │   ├── NotFoundPage/
│   │   └── RegisterPage/
│   ├── services/            # API service layer
│   │   ├── api.js          # Axios instance with interceptors
│   │   ├── authService.js  # Authentication API calls
│   │   └── formService.js  # Form CRUD API calls
│   ├── App.jsx             # Root component with routing
│   ├── App.css
│   ├── index.css           # Global styles & CSS variables
│   └── main.jsx            # Application entry point
├── .env                    # Environment variables
├── .env.example           # Example environment variables
├── package.json
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and set your backend API URL
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🔐 Authentication Flow

### How Authentication Works

1. **Registration/Login:**
   - User submits credentials to `/auth/register` or `/auth/login`
   - Backend validates and returns JWT token + user data
   - Frontend stores token in localStorage
   - AuthContext updates with user information

2. **Authenticated Requests:**
   - Axios interceptor automatically adds `Authorization: Bearer <token>` header
   - All API requests include the token

3. **Protected Routes:**
   - `ProtectedRoute` component checks authentication status
   - Unauthenticated users are redirected to `/login`
   - Original destination is saved for redirect after login

4. **Logout:**
   - Token and user data are cleared from localStorage
   - AuthContext resets to unauthenticated state
   - User is redirected to login page

### Token Storage

```javascript
// Token is stored in localStorage
localStorage.setItem('google_form_clone_token', token);
localStorage.setItem('google_form_clone_user', JSON.stringify(user));
```

## 📡 API Integration

### Service Layer Pattern

All API calls go through the service layer (`src/services/`):

```javascript
// Example: Fetching forms
import { formService } from './services';

const forms = await formService.getAllForms();
```

### Axios Configuration

The API service (`src/services/api.js`) includes:
- Base URL configuration from environment variables
- Request interceptor for adding auth tokens
- Response interceptor for handling 401 errors

### Expected API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login user |
| `/forms` | GET | Get all forms |
| `/forms` | POST | Create new form |
| `/forms/:id` | GET | Get form by ID |
| `/forms/:id` | PUT | Update form |
| `/forms/:id` | DELETE | Delete form |

### Request/Response Format

**Register/Login Request:**
```json
{
  "name": "John Doe",      // register only
  "email": "john@example.com",
  "password": "password123"
}
```

**Register/Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Form Object:**
```json
{
  "_id": "form123",
  "title": "Customer Survey",
  "description": "Please share your feedback",
  "questions": [
    {
      "questionText": "How satisfied are you?",
      "type": "multiple_choice",
      "options": ["Very satisfied", "Satisfied", "Neutral", "Unsatisfied"],
      "required": true
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 🧩 Components Overview

### Common Components

| Component | Description | Props |
|-----------|-------------|-------|
| `Button` | Reusable button | `variant`, `size`, `loading`, `disabled`, `fullWidth` |
| `Input` | Form input field | `label`, `error`, `required`, `helperText` |
| `Textarea` | Multi-line input | `label`, `error`, `rows` |
| `Alert` | Status messages | `type` (success/error/warning/info), `message`, `onClose` |
| `Loader` | Loading spinner | `size`, `text`, `fullScreen` |
| `Card` | Container card | `title`, `onClick` |
| `Modal` | Dialog modal | `isOpen`, `onClose`, `title` |

### Usage Example

```jsx
import { Button, Input, Alert } from './components/common';

function MyForm() {
  return (
    <form>
      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={handleChange}
        error={errors.email}
        required
      />
      <Button type="submit" variant="primary" loading={isLoading}>
        Submit
      </Button>
    </form>
  );
}
```

## 🎨 Styling Guide

### CSS Variables

All colors and common values are defined as CSS variables in `index.css`:

```css
:root {
  --color-primary: #673ab7;
  --color-danger: #d32f2f;
  --color-text: #202124;
  --color-background: #ffffff;
  --shadow-md: 0 1px 3px rgba(0,0,0,0.15);
}
```

### Best Practices

1. **No inline styles** - Use CSS files or CSS modules
2. **Component-scoped CSS** - Each component has its own CSS file
3. **CSS variables for theming** - Easy to maintain and change
4. **Mobile-first responsive design** - Use media queries

## 🔄 State Management

### Local State (useState)

Used for component-specific state:
```jsx
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({ title: '', description: '' });
```

### Context API (useContext)

Used for global state (authentication):
```jsx
const { user, isAuthenticated, login, logout } = useAuth();
```

## 📝 Form Validation

### Client-Side Validation

```jsx
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email';
  }
  
  if (formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 📚 Key Concepts for Beginners

### React Hooks Used

- **useState**: Manage component state
- **useEffect**: Side effects (API calls, subscriptions)
- **useContext**: Access context values
- **useCallback**: Memoize functions
- **useNavigate**: Programmatic navigation (React Router)
- **useParams**: Access URL parameters (React Router)
- **useLocation**: Access current location (React Router)

### Async/Await Pattern

```jsx
const fetchData = async () => {
  try {
    setIsLoading(true);
    const data = await formService.getAllForms();
    setForms(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Protected Route Pattern

```jsx
<Route
  path="/forms"
  element={
    <ProtectedRoute>
      <FormListPage />
    </ProtectedRoute>
  }
/>
```

## 🤝 Contributing

1. Follow the existing folder structure
2. Use functional components with hooks
3. Add comments for complex logic
4. Keep components small and focused
5. Use the service layer for API calls

## 📄 License

MIT
