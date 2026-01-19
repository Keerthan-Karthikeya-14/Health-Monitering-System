// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    App.init();
});

const App = {
    init() {
        this.setupEventListeners();
        this.checkAuthState();
        this.initTheme();
    },

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', this.handleNavigation);
        
        // Theme toggles in navbar and settings Appearance
        const themeToggles = [
            document.getElementById('themeToggle'),
            document.getElementById('darkModeToggle')
        ].filter(btn => !!btn);
        themeToggles.forEach(btn => {
          btn.addEventListener('click', () => this.toggleTheme());
        });

        // Logout button
        /*
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => AuthService.logout());
        }
        */
    },

    checkAuthState() {
        // Keep lightweight; primary guard and redirects handled in AuthService bootstrap
        const path = window.location.pathname;
        const isAuthPage = path.includes('/auth/');
        const isDashboard = path.includes('/dashboard/');
        const user = ApiService.getCurrentUser();

        // Minimal fallback guard
        if (!user && isDashboard) {
            window.location.replace('../auth/login.html');
            return;
        }

        if (user && isAuthPage) {
            // Normalize userType to uppercase for consistent comparison
            const userType = (user.userType || user.role || 'PATIENT').toUpperCase().trim();
            console.log('App.checkAuthState: Already authenticated. UserType:', userType); // DEBUG
            if (userType === 'DOCTOR') {
                window.location.replace('../dashboard/doctor-dashboard.html');
            } else {
                window.location.replace('../dashboard/dashboard.html');
            }
        }
    },

    initTheme() {
    // read theme from cookie
    const match = document.cookie.match(new RegExp('(^| )global-theme=([^;]+)'));
    const savedTheme = match ? decodeURIComponent(match[2]) : 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
    document.cookie = `global-theme=${encodeURIComponent(newTheme)}; path=/; max-age=${60*60*24*365}`;
    },

    handleNavigation(e) {
        const navLink = e.target.closest('[data-route]');
        if (!navLink) return;

        e.preventDefault();
        const route = navLink.getAttribute('data-route');
        window.location.href = route;
    }
};