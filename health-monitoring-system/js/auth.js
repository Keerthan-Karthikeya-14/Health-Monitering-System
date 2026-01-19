// auth.js - Authentication service
class AuthService {
    static async register(userData) {
        const { name, age, gender, contact, email, password, confirmPassword } = userData;
        
        // Validate inputs
        if (!Validator.validateName(name)) {
            throw new Error('Please enter a valid name');
        }

        if (!Validator.validateAge(age)) {
            throw new Error('Please enter a valid age (1-120)');
        }

        if (!Validator.validatePhone(contact)) {
            throw new Error('Please enter a valid contact number');
        }

        if (!Validator.validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        const passwordValidation = Validator.validatePassword(password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message);
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        // Create user object
        const user = {
            id: Utils.generateId(),
            name,
            age: parseInt(age),
            gender,
            contact,
            email: email.toLowerCase(),
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            preferences: {
                theme: 'light',
                notifications: true
            }
        };

        // Save user
        try {
            const savedUser = StorageService.addUser(user);
            return {
                success: true,
                user: {
                    id: savedUser.id,
                    name: savedUser.name,
                    email: savedUser.email
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static login(email, password, rememberMe = false) {
        // Validate inputs
        if (!Validator.validateEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!password) {
            return { success: false, message: 'Please enter your password' };
        }

        const user = StorageService.findUserByEmail(email.toLowerCase());
        
        if (!user || user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Set current user in session
        StorageService.setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email
        });

        // Set remember me
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        return { 
            success: true, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email 
            } 
        };
    }

    static logout() {
        StorageService.clearCurrentUser();
        window.location.href = '/auth/login.html';
    }

    static isAuthenticated() {
        return !!StorageService.getCurrentUser();
    }

    static hashPassword(password) {
        // Simple base64 encoding (in production, use proper hashing like bcrypt)
        return btoa(password);
    }

    static getCurrentUser() {
        return StorageService.getCurrentUser();
    }
}

// Initialize auth forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
            try {
                const result = AuthService.login(email, password, rememberMe);
                if (result.success) {
                    Utils.showToast('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '../dashboard/dashboard.html';
                    }, 1000);
                } else {
                    Utils.showToast(result.message || 'Login failed', 'error');
                }
            } catch (error) {
                Utils.showToast(error.message || 'An error occurred', 'error');
            }
        });

        // Toggle password visibility
        const togglePassword = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                togglePassword.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
            });
        }

        // Check for remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            const emailInput = document.getElementById('email');
            if (emailInput) emailInput.value = rememberedEmail;
            const rememberMeCheckbox = document.getElementById('rememberMe');
            if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
        }
    }

    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const userData = {
                name: formData.get('name'),
                age: formData.get('age'),
                gender: formData.get('gender'),
                contact: formData.get('contact'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };
            
            // Check terms acceptance
            const termsAccepted = document.getElementById('terms')?.checked;
            if (!termsAccepted) {
                Utils.showToast('Please accept the terms and conditions', 'error');
                return;
            }
            
            try {
                const result = await AuthService.register(userData);
                if (result.success) {
                    Utils.showToast('Registration successful! Please log in.', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    Utils.showToast(result.message || 'Registration failed', 'error');
                }
            } catch (error) {
                Utils.showToast(error.message || 'An error occurred', 'error');
            }
        });

        // Password strength indicator
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                const strengthMeter = document.getElementById('passwordStrength');
                const strengthText = document.getElementById('passwordStrengthText');
                
                if (strengthMeter && strengthText) {
                    const strength = Validator.calculatePasswordStrength(password);
                    const label = Validator.getPasswordStrengthLabel(strength);
                    
                    strengthMeter.style.width = `${strength * 20}%`;
                    strengthMeter.className = `strength-meter-fill strength-${strength}`;
                    strengthText.textContent = label;
                }
            });
        }

        // Toggle password visibility for both fields
        const togglePasswordButtons = document.querySelectorAll('.toggle-password');
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.closest('.input-group').querySelector('input');
                if (input) {
                    const type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    button.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
                }
            });
        });

        // Real-time validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                const email = emailInput.value.trim();
                if (email && !Validator.validateEmail(email)) {
                    const errorElement = document.getElementById('emailError');
                    if (errorElement) {
                        errorElement.textContent = 'Please enter a valid email address';
                    }
                } else {
                    const errorElement = document.getElementById('emailError');
                    if (errorElement) {
                        errorElement.textContent = '';
                    }
                }
            });
        }

        const contactInput = document.getElementById('contact');
        if (contactInput) {
            contactInput.addEventListener('blur', () => {
                const contact = contactInput.value.trim();
                if (contact && !Validator.validatePhone(contact)) {
                    const errorElement = document.getElementById('contactError');
                    if (errorElement) {
                        errorElement.textContent = 'Please enter a valid phone number';
                    }
                } else {
                    const errorElement = document.getElementById('contactError');
                    if (errorElement) {
                        errorElement.textContent = '';
                    }
                }
            });
        }
    }
});
