# MediConnect Healthcare Portal - Frontend

A complete frontend interface for a healthcare portal with Patient, Doctor, and Nurse dashboards.

## Quick Start

### Option 1: Using npm (Recommended)
```bash
npm start
```
This will automatically open your browser at `http://localhost:8000`

Or use:
```bash
npm run dev    # Same as npm start
npm run serve  # Start server without auto-opening browser
```

### Option 2: Using Python
```powershell
python -m http.server 8000
```
Then open: `http://localhost:8000`

### Option 3: Direct Browser (Simple but limited)
- Simply double-click `index.html` to open in your browser
- Note: Some features may have limitations when opened directly

## Testing the Interface

1. **Start the server** using one of the methods above
2. **Open the home page** in your browser (index.html)
3. **Test the flow:**
   - Select a role (Patient, Doctor, or Nurse) on the home page
   - You'll be redirected to the login page for that role
   - Enter email and password (for now, any credentials work - backend will handle authentication)
   - After login, you'll be redirected to the appropriate dashboard
   - Use the Logout button to return to the home page
4. **Test forms:**
   - Try filling out forms (appointment booking, lab orders, etc.)
   - Form validation will show errors for empty required fields
5. **Check responsiveness:**
   - Resize your browser window
   - Test on mobile device or use browser dev tools (F12) to simulate mobile

## File Structure

```
MediConnect/
├── index.html              # Home page (role selection)
├── login.html              # Login page (authentication)
├── patient-dashboard.html  # Patient portal
├── doctor-dashboard.html   # Doctor portal
├── nurse-dashboard.html    # Nurse portal
├── styles.css              # All styling
├── script.js               # Main navigation script
├── patient-script.js       # Patient dashboard logic
├── doctor-script.js        # Doctor dashboard logic
├── nurse-script.js         # Nurse dashboard logic
└── package.json            # npm configuration
```

## Features to Test

### Home Page
- ✅ Role selection (Patient, Doctor, Nurse)
- ✅ Redirects to login page based on role

### Login Page
- ✅ Email and password input fields
- ✅ Role-specific login display
- ✅ Form validation
- ✅ Back to home button

### Patient Dashboard
- ✅ Primary doctor information display
- ✅ Appointment booking form
- ✅ Appointments list table
- ✅ Lab results table
- ✅ Treatment history table

### Doctor Dashboard
- ✅ Patients list table
- ✅ Lab order form
- ✅ Treatment form
- ✅ Appointments table

### Nurse Dashboard
- ✅ Shift type and ward display
- ✅ Pending lab results table
- ✅ Lab result conduction form
- ✅ Completed lab results table

## Browser Compatibility

Tested and works on:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari

## Next Steps for Backend Integration

1. Replace commented `fetch()` calls in JavaScript files with actual API endpoints
2. Add authentication middleware
3. Connect forms to MySQL database
4. Populate dropdowns from database queries

## Notes

- All form field IDs and names match database column names for easy backend integration
- The interface uses sessionStorage for role management (will be replaced by backend auth)
- Forms include validation but data is not saved yet (backend will handle this)

