// interactions.js
class UIInteractions {
    static init() {
        // Initialize tooltips
        this.initTooltips();
        
        // Initialize modals
        this.initModals();
        
        // Initialize dropdowns
        this.initDropdowns();
        
        // Initialize mobile menu
        this.initMobileMenu();
        
        // Initialize form validations
        this.initFormValidations();
    }

    static initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltipText = e.target.getAttribute('data-tooltip');
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = tooltipText;
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
                tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
                
                e.target._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', (e) => {
                if (e.target._tooltip) {
                    document.body.removeChild(e.target._tooltip);
                    delete e.target._tooltip;
                }
            });
        });
    }

    static initModals() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Close buttons
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Open modals
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                document.getElementById(modalId).style.display = 'flex';
            });
        });
    }

    static initDropdowns() {
        document.addEventListener('click', (e) => {
            // Close all dropdowns
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });

            // Toggle clicked dropdown
            const dropdownBtn = e.target.closest('.dropdown-toggle');
            if (dropdownBtn) {
                e.preventDefault();
                const dropdown = dropdownBtn.closest('.dropdown');
                dropdown.classList.toggle('active');
            }
        });
    }

    static initMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }
    }

    static initFormValidations() {
        // Password strength meter
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validatePasswordStrength(e.target);
            });
        });

        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateEmail(e.target);
            });
        });
    }

    static validatePasswordStrength(input) {
        const password = input.value;
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        // Contains number
        if (/\d/.test(password)) strength++;
        // Contains letter
        if (/[a-zA-Z]/.test(password)) strength++;
        // Contains special char
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Update UI
        const strengthMeter = input.nextElementSibling;
        if (strengthMeter && strengthMeter.classList.contains('strength-meter')) {
            strengthMeter.style.width = `${strength * 25}%`;
            strengthMeter.className = `strength-meter strength-${strength}`;
        }
    }

    static validateEmail(input) {
        const email = input.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        if (email && !isValid) {
            this.showError(input, 'Please enter a valid email address');
            return false;
        }
        return true;
    }

    static showError(input, message) {
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        errorElement.textContent = message;
        input.classList.add('error');
    }

    static showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 100);
    }
}

// Initialize interactions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UIInteractions.init();
});