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
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => AuthService.logout());
        }
    },

    checkAuthState() {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('auth/');
        const isAuthenticated = AuthService.isAuthenticated();

        if (!isAuthenticated && !isAuthPage) {
            window.location.href = '/auth/login.html';
        } else if (isAuthenticated && isAuthPage) {
            window.location.href = '/dashboard/dashboard.html';
        }
    },

    initTheme() {
        const savedTheme = StorageService.getPreference('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        StorageService.setPreference('theme', newTheme);
    },

    handleNavigation(e) {
        const navLink = e.target.closest('[data-route]');
        if (!navLink) return;

        e.preventDefault();
        const route = navLink.getAttribute('data-route');
        window.location.href = route;
    }
};