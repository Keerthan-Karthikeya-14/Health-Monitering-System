// auth.js - Authentication service
class AuthService {
    static async register(userData) {
        const { name, age, gender, contact, email, password, confirmPassword, userType } = userData;
        
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

        // Create payload for backend (do not hash passwords on client — backend will hash)
        const payload = {
            username: name, // Map 'name' from form to 'username' for backend
            age: age ? parseInt(age) : null,
            gender,
            contact,
            email: email.toLowerCase(),
            password,
            userType // Use the already mapped userType
        };

        // Save user via backend API
        try {
            console.log('Registering user with payload:', payload); // DEBUG
            const resp = await ApiService.register(payload);
            console.log('Registration API response:', resp); // DEBUG
            
            // Auto-login after successful registration to enable immediate redirect
            if (resp && resp.user) {
                console.log('Registration successful, attempting auto-login...'); // DEBUG
                console.log('User object from registration:', resp.user); // DEBUG
                try {
                    const loginResult = await AuthService.login(payload.email, payload.password, false);
                    console.log('Auto-login result:', loginResult); // DEBUG
                    if (loginResult.success) {
                        console.log('Auto-login successful. User object:', loginResult.user); // DEBUG
                        console.log('UserType from auto-login:', loginResult.user?.userType); // DEBUG
                        return { success: true, user: loginResult.user, autoLoggedIn: true };
                    }
                } catch (err) { 
                    console.error('Auto-login failed:', err); // DEBUG
                    /* ignore auto-login failure, fall back to login page */ 
                }
            }
            console.log('Returning registration response with user:', resp.user); // DEBUG
            return { success: true, user: resp.user };
        } catch (error) {
            console.error('Registration error:', error); // DEBUG
            return { success: false, message: error.message };
        }
    }

    static async login(email, password, rememberMe = false) {
        // Validate inputs
        if (!Validator.validateEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!password) {
            return { success: false, message: 'Please enter your password' };
        }

        try {
            const resp = await ApiService.login(email.toLowerCase(), password);
            // expected resp: { token, user }
            ApiService.setAuth(resp.token, resp.user);

            // Set remember me via cookie (email only)
            if (rememberMe) {
                document.cookie = `rememberedEmail=${encodeURIComponent(email)}; path=/; max-age=${60*60*24*30}`;
            } else {
                document.cookie = `rememberedEmail=; Max-Age=0; path=/`;
            }

            return { success: true, user: resp.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static logout() {
        console.log('AuthService.logout called'); // DEBUG
        ApiService.logout();
        try { localStorage.clear(); } catch (_) {}
        try { sessionStorage.clear(); } catch (_) {}
        Utils.showToast('Logout successful!', 'success');
        console.log('Attempting immediate redirection after logout...'); // DEBUG
        // Use replace to prevent navigating back to protected pages
        window.location.replace('../login.html');
    }

    static isAuthenticated() {
        console.log('AuthService.isAuthenticated called'); // DEBUG
        return !!ApiService.getCurrentUser();
    }

    static hashPassword(password) {
        // Simple base64 encoding (in production, use proper hashing like bcrypt)
        return btoa(password);
    }

    static getCurrentUser() {
        return ApiService.getCurrentUser();
    }
}

// Initialize auth forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Global auth guard and logout wiring
    try {
        const path = window.location.pathname;
        const isAuthPage = path.includes('login.html') || path.includes('signup.html');
        const user = ApiService.getCurrentUser();
        // Guard: block dashboard pages if not authenticated
        if (!isAuthPage && (path.includes('/dashboard/') || path.endsWith('index.html'))) {
            if (!user) {
                window.location.replace('login.html');
                return;
            }
        }
        // If on auth pages and already authenticated, route to respective dashboard
        if (isAuthPage && user) {
            // Normalize userType to uppercase for consistent comparison
            const userType = (user.userType || user.role || 'PATIENT').toUpperCase().trim();
            console.log('Already authenticated on auth page. UserType:', userType); // DEBUG
            if (userType === 'DOCTOR') {
                console.log('Redirecting to DOCTOR dashboard...'); // DEBUG
                window.location.replace('dashboard/doctor-dashboard.html');
            } else {
                console.log('Redirecting to PATIENT dashboard...'); // DEBUG
                window.location.replace('dashboard/dashboard.html');
            }
            return;
        }
        // Wire all logout buttons
        const logoutSelectors = ['#logoutBtn', '#logout-btn', '.logout-button', '.logout-btn'];
        const logoutButtons = document.querySelectorAll(logoutSelectors.join(', '));
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthService.logout();
            });
        });
    } catch (e) {
        console.error('Auth bootstrap error:', e);
    }
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
                try {
                    console.log('Attempting login with:', email); // DEBUG
                    const result = await AuthService.login(email, password, rememberMe);
                    console.log('Login result:', result); // DEBUG

                    if (result.success) {
                        console.log('Login successful, redirecting...'); // DEBUG
                        console.log('User object after login:', result.user); // DEBUG: Inspect user object
                        // Normalize userType to uppercase for consistent comparison
                        const userType = (result.user?.userType || result.user?.role || 'PATIENT').toUpperCase().trim();
                        console.log('Redirecting based on userType:', userType); // DEBUG: Show determined role
                        
                        // Redirect based on role
                        if (userType === 'DOCTOR') {
                            console.log('Redirecting to DOCTOR dashboard...'); // DEBUG
                            window.location.href = 'dashboard/doctor-dashboard.html';
                        } else {
                            console.log('Redirecting to PATIENT dashboard...'); // DEBUG
                            window.location.href = 'dashboard/dashboard.html';
                        }
                        } else {
                            console.error('Login failed:', result.message); // DEBUG
                            Utils.showToast(result.message || 'Login failed', 'error');
                        }
                    } catch (error) {
                        console.error('Login error:', error); // DEBUG
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

        // Check for remembered email (cookie-based)
        {
            const match = document.cookie.match(new RegExp('(^| )rememberedEmail=([^;]+)'));
            const rememberedEmail = match ? decodeURIComponent(match[2]) : null;
            if (rememberedEmail) {
                const emailInput = document.getElementById('email');
                if (emailInput) emailInput.value = rememberedEmail;
                const rememberMeCheckbox = document.getElementById('rememberMe');
                if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
            }
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
                confirmPassword: formData.get('confirmPassword'),
                // Map 'role' from form to 'userType' for backend
                userType: formData.get('role')
            };
            
            // Check terms acceptance
            const termsAccepted = document.getElementById('terms')?.checked;
            if (!termsAccepted) {
                Utils.showToast('Please accept the terms and conditions', 'error');
                return;
            }
            
            try {
                console.log('=== REGISTRATION START ==='); // DEBUG
                console.log('Attempting registration with:', userData); // Debug log
                const result = await AuthService.register(userData);
                console.log('=== REGISTRATION RESULT ==='); // DEBUG
                console.log('Full result object:', JSON.stringify(result, null, 2)); // DEBUG
                
                if (result.success) {
                    // Normalize userType to uppercase for consistent comparison
                    const userType = (result.user?.userType || result.user?.role || formData.get('role') || 'PATIENT').toUpperCase().trim();
                    console.log('=== REDIRECT LOGIC ==='); // DEBUG
                    console.log('Result.user:', result.user); // DEBUG
                    console.log('Result.user.userType:', result.user?.userType); // DEBUG
                    console.log('Result.user.role:', result.user?.role); // DEBUG
                    console.log('Form role:', formData.get('role')); // DEBUG
                    console.log('Final normalized userType:', userType); // DEBUG
                    console.log('Auto-logged in?', result.autoLoggedIn); // DEBUG
                    
                    Utils.showToast('Registration successful!', 'success');
                    
                    // If auto-login occurred, we can route straight away
                    if (result.autoLoggedIn) {
                        console.log('=== AUTO-LOGIN SUCCESS - REDIRECTING ==='); // DEBUG
                        console.log('Redirecting based on userType:', userType); // DEBUG
                        if (userType === 'DOCTOR') {
                            console.log('→ Redirecting to DOCTOR dashboard: dashboard/doctor-dashboard.html'); // DEBUG
                            window.location.href = 'dashboard/doctor-dashboard.html';
                        } else {
                            console.log('→ Redirecting to PATIENT dashboard: dashboard/dashboard.html'); // DEBUG
                            window.location.href = 'dashboard/dashboard.html';
                        }
                    } else {
                        // Fallback: go to login page prefilled
                        console.log('=== NO AUTO-LOGIN - REDIRECTING TO LOGIN ==='); // DEBUG
                        window.location.replace('login.html');
                    }
                } else {
                    console.error('Registration failed:', result.message); // Debug log
                    Utils.showToast(result.message || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('=== REGISTRATION EXCEPTION ==='); // DEBUG
                console.error('Error:', error); // Debug log
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
