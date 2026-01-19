// api.js - ApiService replaces StorageService/local/session storage usage
const ApiService = (function() {
    // Backend base URL - ensure it matches Spring Boot server port (application.properties uses 8080)
    const BASE = 'http://localhost:8080/api';

    // Cookie helpers (simple, not HttpOnly)
    function setCookie(name, value, days = 7) {
        const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}`;
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
    }

    async function request(path, options = {}) {
        const headers = options.headers || {};
        const token = getCookie('auth_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';

        const res = await fetch(BASE + path, {
            ...options,
            headers,
        });
        const text = await res.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) {
            const err = (data && data.message) ? data.message : res.statusText || 'Request failed';
            throw new Error(err);
        }
        return data;
    }

    return {
        // Auth
        async login(email, password) {
            return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        },
        async register(userData) {
            return request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
        },
        logout() {
            console.log('ApiService.logout called: Clearing cookies'); // DEBUG
            deleteCookie('auth_token');
            deleteCookie('currentUser');
            console.log('Cookies cleared. auth_token:', getCookie('auth_token'), 'currentUser:', getCookie('currentUser')); // DEBUG
        },
        setAuth(token, user) {
            console.log('ApiService.setAuth called: Setting cookies for user:', user); // DEBUG
            if (token) setCookie('auth_token', token, 7);
            if (user) setCookie('currentUser', JSON.stringify(user), 7);
        },
        getCurrentUser() {
            const u = getCookie('currentUser');
            console.log('ApiService.getCurrentUser called. Raw cookie value:', u); // DEBUG
            return u ? JSON.parse(u) : null;
        },

        // Users
        async getUserById(id) { return request(`/users/${id}`); },
        async getAllUsers() { return request('/users'); },

        // Health records
        // Legacy endpoints (kept for compatibility)
        async getHealthRecords(userId) { return request(`/users/${userId}/records`); },
        async createHealthRecord(userId, record) { return request(`/users/${userId}/records`, { method: 'POST', body: JSON.stringify(record) }); },
        async deleteHealthRecord(recordId) { return request(`/records/${recordId}`, { method: 'DELETE' }); },
        async getHealthRecordById(recordId) { return request(`/records/${recordId}`); },
        async updateHealthRecord(recordId, updates) { return request(`/records/${recordId}`, { method: 'PATCH', body: JSON.stringify(updates) }); },

        // New endpoints per spec
        async createRecordV2(record) { return request('/patient/records', { method: 'POST', body: JSON.stringify(record) }); },
        async getUserRecordsV2(userId) { return request(`/patient/records/patient/${userId}`); },
        // NEW: Get ALL medical records (for doctor dashboard)
        async getAllMedicalRecords() { 
            console.log('🔍 Fetching ALL medical records');
            return request('/patient/records/all'); 
        },

        // Appointments
        async getAppointments(query = '') { return request(`/appointments${query}`); },
        // Legacy shape (appointmentDate)
        async createAppointment(appt) { return request('/appointments', { method: 'POST', body: JSON.stringify(appt) }); },
        // New endpoints per spec
        async createAppointmentV2(appt) { return request('/appointments', { method: 'POST', body: JSON.stringify(appt) }); },
        async getDoctorAppointmentsV2(doctorId) { return request(`/appointments/doctor/${doctorId}`); },
        async getPatientAppointmentsV2(patientId) { return request(`/appointments/patient/${patientId}`); },
        async saveSuggestion(apptId, suggestion) { return request(`/appointments/${apptId}/suggestion`, { method: 'POST', body: JSON.stringify({ note: suggestion }) }); },
        // NEW: Get ALL appointments for doctor dashboard (no doctor ID filter)
        async getAllAppointmentsForDoctor() { 
            console.log('🔍 Fetching ALL appointments for doctor dashboard');
            return request('/appointments/doctor/all-appointments'); 
        },
        // Complete appointment with suggestion
        async completeAppointment(appointmentId, suggestion, doctorId) { 
            return request(`/appointments/${appointmentId}/complete`, { 
                method: 'POST', 
                body: JSON.stringify({ suggestion, doctorId }) 
            }); 
        },

    // Doctor endpoints
    async getDoctorAppointments(doctorId) { return request(`/doctor/appointments?doctorId=${doctorId}`); },
    async getDoctorStatistics(doctorId) { return request(`/doctor/${doctorId}/statistics`); },
    async getDoctorAppointment(appointmentId) { return request(`/doctor/appointments/${appointmentId}`); },
    async addDoctorNotes(appointmentId, notes, status) { return request(`/doctor/appointments/${appointmentId}/notes`, { method: 'PUT', body: JSON.stringify({ doctorNotes: notes, status }) }); },
    async listPatients() { return request('/doctor/patients'); },
    async addRecordSuggestion(recordId, suggestions) { return request(`/doctor/patient/records/${recordId}/suggestions`, { method: 'PUT', body: JSON.stringify({ doctorSuggestions: suggestions }) }); },

    // Health metrics endpoints
    async getHealthSummary(patientId) { return request(`/patient/${patientId}/health-summary`); },
    async getHealthData(patientId, period = 30) { return request(`/patient/${patientId}/health-data?period=${period}`); },
    async getDoctorSuggestions(patientId) { return request(`/patient/${patientId}/doctor-suggestions`); },
    async generateReport(patientId) { return request(`/patient/${patientId}/generate-report`); },

        // generic request
        request
    };
})();
