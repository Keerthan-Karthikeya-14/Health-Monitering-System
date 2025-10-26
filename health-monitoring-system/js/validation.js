// validation.js - Form validation utilities
class Validator {
    // Email validation
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation (min 8 chars, at least one letter and one number)
    static validatePassword(password) {
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters long' };
        }
        if (!/[a-zA-Z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one letter' };
        }
        if (!/\d/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true, message: 'Password is valid' };
    }

    // Phone number validation
    static validatePhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    // Name validation
    static validateName(name) {
        return name && name.trim().length >= 2;
    }

    // Age validation
    static validateAge(age) {
        const ageNum = parseInt(age);
        return !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120;
    }

    // Password strength calculator
    static calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return Math.min(5, strength);
    }

    // Get password strength label
    static getPasswordStrengthLabel(strength) {
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        return labels[Math.min(strength - 1, 4)] || 'Very Weak';
    }

    // Validate form field and show error
    static validateField(field, validationFn, errorMessage) {
        const value = field.value.trim();
        const isValid = validationFn(value);
        
        const errorElement = field.parentElement.parentElement.querySelector('.error-message');
        
        if (!isValid) {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
            return false;
        } else {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
            }
            return true;
        }
    }

    // Clear all errors in a form
    static clearErrors(form) {
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.textContent = '');
        
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }
}
