# Health Monitoring System

A complete, production-ready Health Monitoring System built with modern web technologies. Features a beautiful sky blue theme, comprehensive health tracking, and AI-powered insights.

## Features

### Authentication System
- **User Registration** with validation
- **Secure Login** with session management
- **Password Strength Meter**
- **Remember Me** functionality
- **Session-based Authentication**

### Dashboard
- **Health Score Visualization** with animated circular progress
- **Real-time Health Metrics** (Heart Rate, Blood Pressure, Steps, Appointments)
- **Interactive Charts** using Chart.js
- **Recent Records Table** with quick actions
- **Responsive Design** for all devices

### Health Records Management (CRUD)
- **Create** new health records with multiple types
- **Read** and filter records by type and date
- **Update** existing records
- **Delete** records with confirmation
- **Export** data as JSON or CSV
- **Record Types**: Heart Rate, Blood Pressure, Blood Sugar, Temperature, Weight, Oxygen Level, Sleep

### Reports & Analytics
- **Health Trends** visualization
- **Record Distribution** charts
- **Monthly Activity** tracking
- **AI-Powered Insights** (simulated)
- **Summary Statistics**

### Settings
- **Profile Management**
- **Theme Toggle** (Light/Dark mode)
- **Notification Preferences**
- **Privacy & Security** options
- **Data Export/Clear** functionality

##  Design Features

- **Sky Blue Theme** (#87CEEB) with professional medical aesthetics
- **Smooth Animations** and transitions
- **Glassmorphism** effects
- **Responsive Layout** (Mobile-first approach)
- **Accessible** with ARIA labels and semantic HTML
- **Modern UI Components**: Cards, Modals, Toasts, FAB buttons

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Variables, Flexbox, Grid, Animations
- **Vanilla JavaScript (ES6+)** - Modular architecture
- **Chart.js** - Data visualization
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

### Data Management
- **LocalStorage** - User data and health records
- **SessionStorage** - Active user sessions
- **No Backend Required** - Fully client-side

##  Project Structure

```
health-monitoring-system/
├── index.html                 # Router/Entry point
├── auth/
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   └── auth.css              # Auth-specific styles
├── dashboard/
│   ├── dashboard.html        # Main dashboard
│   ├── my-records.html       # Records management
│   ├── reports.html          # Analytics & reports
│   └── settings.html         # User settings
├── css/
│   ├── variables.css         # CSS custom properties
│   ├── global.css            # Global styles & resets
│   ├── components.css        # Reusable components
│   ├── dashboard.css         # Dashboard-specific styles
│   ├── animations.css        # Keyframe animations
│   └── responsive.css        # Media queries
├── js/
│   ├── storage.js            # LocalStorage management
│   ├── auth.js               # Authentication logic
│   ├── validation.js         # Form validation
│   ├── crud.js               # CRUD operations
│   ├── utils.js              # Utility functions
│   ├── dashboard.js          # Dashboard logic
│   ├── charts.js             # Chart initialization
│   ├── data.js               # Mock data
│   └── interactions.js       # UI interactions
└── assets/
    └── icons/                # Custom icons (if any)
```

##  Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required!

### Installation

1. **Clone or Download** the project
   ```bash
   git clone <repository-url>
   cd health-monitoring-system
   ```

2. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```

3. **Start Using**
   - Register a new account
   - Log in with your credentials
   - Start tracking your health!

## 📖 Usage Guide

### First Time Setup

1. **Register an Account**
   - Navigate to the registration page
   - Fill in your details (Name, Age, Gender, Contact, Email, Password)
   - Accept terms and conditions
   - Click "Create Account"

2. **Login**
   - Enter your email and password
   - Optionally check "Remember Me"
   - Click "Sign In"

### Adding Health Records

1. **From Dashboard**
   - Click the blue FAB (Floating Action Button) at bottom-right
   - Or click "Add Record" button

2. **Fill Record Details**
   - Select record type (Heart Rate, Blood Pressure, etc.)
   - Enter value and unit
   - Add optional notes
   - Click "Save Record"

### Managing Records

1. **View All Records**
   - Navigate to "My Records" from sidebar
   - Use filters to search by type or date range

2. **Edit/Delete Records**
   - Click edit icon to modify
   - Click delete icon to remove (with confirmation)

3. **Export Data**
   - Click "Export" button
   - Choose JSON or CSV format

### Viewing Reports

1. **Navigate to Reports**
   - Click "Reports" in sidebar
   - View health trends and statistics
   - See AI-powered insights

### Customizing Settings

1. **Go to Settings**
   - Update profile information
   - Toggle dark mode
   - Manage notifications
   - Change password
   - Export or clear data

## Security Features

- **Password Hashing** (Base64 - upgrade to bcrypt for production)
- **Session Management** with SessionStorage
- **Input Validation** on all forms
- **XSS Prevention** with sanitization
- **CSRF Protection** (client-side only)

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Key JavaScript Classes

### `StorageService`
Manages all localStorage and sessionStorage operations
```javascript
StorageService.addUser(user)
StorageService.getCurrentUser()
StorageService.getHealthRecords(userId)
```

### `AuthService`
Handles authentication and authorization
```javascript
AuthService.register(userData)
AuthService.login(email, password)
AuthService.logout()
```

### `HealthRecordManager`
CRUD operations for health records
```javascript
recordManager.createRecord(data)
recordManager.getAllRecords(filters)
recordManager.updateRecord(id, updates)
recordManager.deleteRecord(id)
```

### `Validator`
Form validation utilities
```javascript
Validator.validateEmail(email)
Validator.validatePassword(password)
Validator.calculatePasswordStrength(password)
```

### `Utils`
General utility functions
```javascript
Utils.showToast(message, type)
Utils.formatDate(date, format)
Utils.getGreeting()
```

## Color Palette

```css
--primary-color: #87CEEB;      /* Sky Blue */
--primary-dark: #5DADE2;       /* Darker Blue */
--primary-light: #E0F7FF;      /* Light Blue */
--secondary-color: #4A90E2;    /* Secondary Blue */
--success-color: #48BB78;      /* Green */
--warning-color: #F6AD55;      /* Orange */
--danger-color: #F56565;       /* Red */
--text-primary: #2D3748;       /* Dark Gray */
--text-secondary: #718096;     /* Medium Gray */
--bg-color: #F5F7FA;           /* Light Gray */
--card-bg: #FFFFFF;            /* White */
```

## Customization

### Changing Theme Colors
Edit `css/variables.css` or `css/dashboard.css`:
```css
:root {
    --primary-color: #YOUR_COLOR;
}
```

### Adding New Record Types
Edit `js/crud.js` and add to the record type options in HTML forms.

### Modifying Health Score Calculation
Edit the `calculateHealthScore()` function in `js/dashboard.js`.

##  Known Limitations

- **Client-Side Only**: All data stored in browser (cleared on cache clear)
- **No Real Backend**: No server-side validation or database
- **Basic Password Hashing**: Use proper hashing (bcrypt) for production
- **No Email Verification**: Registration doesn't send verification emails
- **Limited AI Insights**: Insights are simulated, not real AI

##  Future Enhancements

- [ ] Backend integration with Node.js/Express
- [ ] Real database (MongoDB/PostgreSQL)
- [ ] Email verification and password reset
- [ ] Real-time notifications
- [ ] Doctor appointment booking
- [ ] Medication reminders
- [ ] Integration with wearable devices
- [ ] Multi-language support
- [ ] PWA (Progressive Web App) support
- [ ] Real AI/ML health insights

## License

This project is open source and available under the [MIT License](LICENSE).

##  Developer

Created with  for health monitoring and tracking.

## Contributing

Contributions, issues, and feature requests are welcome!

## Support

For support, email your-email@example.com or open an issue in the repository.

---

**Note**: This is a frontend-only demonstration project. For production use, implement proper backend security, database management, and server-side validation.
