# Google Form Clone

A full-stack web application that replicates Google Forms functionality, allowing users to create, share, and collect responses from custom forms.

## 🚀 Features

### Form Management
- Create, edit, and delete forms
- Multiple question types: Short Answer, Multiple Choice, Checkbox, Dropdown
- Drag-and-drop question reordering
- Form publishing and draft modes

### Response Collection
- Public form sharing via unique links
- Required field validation
- Multi-section form navigation
- Real-time form submission

### Analytics Dashboard
- Response statistics and visualizations
- Pie charts for multiple choice questions
- Bar charts for checkbox questions
- Word frequency analysis for text responses
- Individual submission details

### User Experience
- Autosave functionality
- Responsive design
- Smooth animations and transitions
- Delete confirmations

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization
- **@dnd-kit** - Drag and drop

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL** - Database
- **JWT** - Authentication

## 📁 Project Structure

```
google-form-clone/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── context/         # React context providers
│   │   └── styles/          # Global styles
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Express middlewares
│   │   └── config/          # Configuration files
│   ├── database/            # SQL schema
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/google-form-clone.git
   cd google-form-clone
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the backend folder:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=form_builder
   JWT_SECRET=your_jwt_secret
   ```

4. **Set up the database**
   ```bash
   # Run the SQL schema in your MySQL client
   mysql -u your_username -p < database/schema.sql
   ```

5. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Forms
- `GET /api/forms` - Get all forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get form by ID
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Questions
- `GET /api/forms/:formId/questions` - Get questions
- `POST /api/forms/:formId/questions` - Create question
- `PUT /api/forms/:formId/questions/:id` - Update question
- `DELETE /api/forms/:formId/questions/:id` - Delete question
- `PUT /api/forms/:formId/questions/reorder` - Reorder questions

### Responses
- `POST /api/forms/:formId/responses` - Submit response
- `GET /api/forms/:formId/submissions` - Get submissions

## 👤 Author

**Faishal Falih**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
