// doctor-dashboard.js - Logic for Doctor Dashboard

document.addEventListener('DOMContentLoaded', async () => {
    const current = ApiService.getCurrentUser();
    if (!current) { 
        console.log('No user found, redirecting to login'); // DEBUG
        window.location.href = '../auth/login.html'; 
        return; 
    }
    // Normalize userType to uppercase for consistent comparison
    const userType = (current.userType || current.role || 'PATIENT').toUpperCase().trim();
    console.log('Doctor dashboard: UserType detected:', userType); // DEBUG
    if (userType !== 'DOCTOR') { 
        console.log('Not a doctor, redirecting to patient dashboard'); // DEBUG
        window.location.href = '../dashboard/dashboard.html'; 
        return; 
    }
    await initDoctorDashboard();
});

function seedDoctorDemoData() { /* removed - backend should seed data */ }

async function initDoctorDashboard() {
    // Disabled - no backend support for doctor dashboard
    const mainContent = document.querySelector('.dashboard-container') || document.body;
    mainContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><h2>Doctor Dashboard Disabled</h2><p>This feature is not available in the authentication-only system.</p></div>';
}

function updateDateTime() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        currentDateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

async function loadDoctorStatistics() {
    // Disabled - no backend support for doctor statistics
    console.log('Doctor statistics disabled - authentication only system');
}

function openSettings() {
    document.getElementById('settingsModal')?.classList.add('show');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
}

// Appointments code moved to doctor-appointments.js

// Notes for integrators:
// - Suggestions are saved both per-appointment (appointmentSuggestion_<appointmentId>) and appended
//   to the patient feed (patientReports_<patientId>) so the patient Reports page can read them.
// - Dummy logins: doctor@healthtrack.com / Doctor@123, patient@healthtrack.com / Patient@123

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
        });
    }
    
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
        });
    }
});

