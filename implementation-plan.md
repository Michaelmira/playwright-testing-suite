# Implementation Plan for Playwright Testing Web App

## 1. Architecture Overview

### Frontend (React)
- Extend existing Layout.jsx with auth-aware navigation
- Add new routes in routes.jsx:
  - /login
  - /dashboard
  - /excel/:id
- New Components:
  - Login Page
  - Dashboard
  - Excel Editor
  - Protected Route Wrapper

### Backend (Flask)
- Extend existing routes.py with new endpoints
- Add JWT middleware
- Add new models to models.py
- Utilize existing admin setup for new models

## 2. Database Schema

### User Table (Existing)
- id (PK)
- email
- password (hashed)
- is_active

### Excel File Table (New)
- id (PK)
- name
- description
- created_date
- modified_date
- content (JSON/BLOB)
- user_id (FK to User)

## 3. API Endpoints (in routes.py)

### Authentication
```python
@api.route('/login', methods=['POST'])
@api.route('/logout', methods=['POST'])
```

### Excel Files
```python
@api.route('/files', methods=['GET'])  # with sort params
@api.route('/files', methods=['POST'])
@api.route('/files/<int:id>', methods=['PUT'])
@api.route('/files/<int:id>', methods=['DELETE'])
@api.route('/files/<int:id>', methods=['GET'])
```

## 4. State Management (Using Existing Setup)

### Store Structure
```javascript
{
  auth: {
    token: null,
    user: null,
    isAuthenticated: false,
    error: null
  },
  files: {
    list: [],
    currentFile: null,
    sortOrder: null,
    sortField: null,
    error: null
  }
}
```

### Actions
```javascript
// Auth Actions
'auth/login'
'auth/logout'
'auth/setError'

// Files Actions
'files/setList'
'files/setCurrentFile'
'files/setSorting'
'files/delete'
'files/update'
'files/create'
'files/setError'
```

## 5. Frontend Routes Structure

```jsx
<Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
  <Route path="/login" element={<Login />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/excel/:id" element={<ExcelEditor />} />
  </Route>
  {/* Keep existing routes */}
  <Route path="/" element={<Home />} />
  <Route path="/single/:theId" element={<Single />} />
  <Route path="/demo" element={<Demo />} />
</Route>
```

## 6. Frontend Components Detail

### Login Page
- Email input field
- Password input field
- Submit button
- Error message display area (using store.auth.error)
- JWT token storage in session storage

### Dashboard
- Excel files table/chart with columns:
  - File name
  - Creation date
  - Description
  - Actions (delete, edit)
- Sorting controls using store.files.sortOrder and store.files.sortField:
  - Name (A-Z, Z-A)
  - Date (newest-oldest, oldest-newest)
- Create new file button

### Excel Editor
- File name input
- Description input
- Basic spreadsheet interface
- Save button
- Cancel button

## 7. Test Scenarios Overview
Note: These will be implemented separately by you in JavaScript/Playwright

### Login Features to Test
- Empty email validation
- Empty password validation
- Incorrect password validation
- Successful login and redirect

### Dashboard Features to Test
- File sorting (A-Z, Z-A)
- File sorting by date
- File creation
- File deletion
- File content editing

## 8. Implementation Phases

### Phase 1: Setup
1. Install required dependencies
2. Add new models to models.py
3. Configure JWT in app.py
4. Extend store.js with new state structure
5. Add new actions to storeReducer

### Phase 2: Backend Development
1. Add JWT middleware to routes.py
2. Implement auth endpoints
3. Create Excel file endpoints
4. Set up file storage system
5. Add new models to admin interface

### Phase 3: Frontend Development
1. Create ProtectedRoute component
2. Add new routes to routes.jsx
3. Create Login page (integrated with store)
4. Implement Dashboard with sorting (using store.files state)
5. Develop Excel editor interface
6. Update Layout.jsx with auth-aware navigation

### Phase 4: Testing Environment Setup
1. Set up Playwright configuration
2. Create test data fixtures
3. Set up test environment variables

## 9. Required Dependencies

### Backend (Python)
- flask-jwt-extended
- sqlalchemy (already included)
- flask-cors (already included)

### Frontend (Node)
- react-router-dom (already included)
- axios
- @tanstack/react-table (for table management)
- react-spreadsheet (for Excel-like interface)

### Testing
- @playwright/test

## 10. Security Considerations
- JWT token storage in session storage
- Password hashing
- CORS configuration (already set up)
- Input validation
- XSS prevention
- CSRF protection

## 11. Next Steps
1. Review and approve implementation plan
2. Set up project structure
3. Begin with Phase 1 implementation
4. Regular testing throughout development 