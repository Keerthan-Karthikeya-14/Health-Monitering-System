// doctor-appointments.js - Doctor appointments list and suggestions

document.addEventListener('DOMContentLoaded', async () => {
    const current = ApiService.getCurrentUser();
    if (!current) { 
        console.log('No user found, redirecting to login'); // DEBUG
        window.location.href = '../auth/login.html'; 
        return; 
    }
    // Enforce doctor-only access - check userType instead of role
    const userType = (current.userType || current.role || 'PATIENT').toUpperCase().trim();
    console.log('Doctor appointments page: UserType detected:', userType); // DEBUG
    if (userType !== 'DOCTOR') { 
        console.log('Not a doctor, redirecting to patient dashboard'); // DEBUG
        window.location.href = '../dashboard/dashboard.html'; 
        return; 
    }

    // Disabled - no backend support for doctor appointments
    const mainContent = document.querySelector('.appointments-container') || document.body;
    mainContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><h2>Doctor Appointments Disabled</h2><p>This feature is not available in the authentication-only system.</p></div>';
});

// backend-driven; no local seeding
function seedDoctorDemoData() { }

async function getDoctorAppointments() {
    const user = ApiService.getCurrentUser();
    if (!user || !user.id) {
        console.error('No user or user.id found');
        return [];
    }
    try {
        console.log('🔍 Fetching ALL appointments for all doctors');
        // Fetch ALL appointments for all doctors (no filtering)
        const response = await ApiService.getAllAppointmentsForDoctor();
        console.log('✅ All appointments response:', response);
        const appointments = Array.isArray(response) ? response : [];
        console.log(`📋 Total appointments from all doctors: ${appointments.length}`);
        
        return appointments.map(appt => ({
            ...appt,
            patient: appt.patientId ? {
                id: appt.patientId,
                username: appt.patientName,
                email: appt.patientEmail
            } : null,
            doctor: appt.doctorId ? {
                id: appt.doctorId,
                username: appt.doctorName,
                email: appt.doctorEmail
            } : null
        }));
    } catch (error) {
        console.error('❌ Error fetching all appointments:', error);
        Utils.showToast('Unable to load appointments. Please try again.', 'error');
        return [];
    }
}

async function saveSuggestion(appt, text) {
    return ApiService.saveSuggestion(appt.id, text);
}

async function renderAppointments() {
    const tbody = document.getElementById('appointmentsBody');
    if (!tbody) {
        console.error('appointmentsBody element not found');
        return;
    }
    
    // Show loading state
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading appointments...</td></tr>';
    
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    console.log('📋 Fetching appointments with status filter:', statusFilter); // DEBUG
    
    let rows = await getDoctorAppointments();
    console.log('Fetched doctor appointments:', rows); // DEBUG

    // Filter only pending/upcoming appointments (exclude completed)
    const pendingRows = rows.filter(r => {
        const status = (r.status || 'PENDING').toUpperCase();
        return status !== 'COMPLETED';
    });
    
    // Apply status filter
    let filteredRows = pendingRows;
    if (statusFilter !== 'all') {
        const filterUpper = statusFilter.toUpperCase();
        filteredRows = pendingRows.filter(r => {
            const status = (r.status || 'PENDING').toUpperCase();
            return status === filterUpper ||
                (filterUpper === 'UPCOMING' && (status === 'PENDING' || status === 'CONFIRMED'));
        });
    }

    console.log('📋 Pending appointments:', filteredRows.length); // DEBUG

    if (filteredRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No pending appointments found.</td></tr>';
        return;
    }
    tbody.innerHTML = filteredRows.map(appt => {
        const patientName = appt.patientName || (appt.patient && (appt.patient.username || appt.patient.name)) || 'Unknown Patient';
        const patientDisplay = Utils.sanitizeHTML(patientName);
        const reasonText = Utils.sanitizeHTML(appt.reason || 'General Checkup');
        const statusText = (appt.status || 'PENDING').toUpperCase();
        const isCancelled = statusText === 'CANCELLED';
        const statusClass = statusText === 'COMPLETED' ? 'status-completed'
            : statusText === 'CANCELLED' ? 'status-cancelled'
            : 'status-upcoming';
        const dateValue = appt.appointmentDate || appt.appointment_date || appt.datetime || appt.date;
        let dateStr = 'N/A';
        if (dateValue) {
            try {
                dateStr = Utils.formatDate(dateValue, 'datetime');
            } catch (e) {
                dateStr = String(dateValue);
            }
        }
        const suggestionText = Utils.sanitizeHTML(appt.doctorNotes || '');
        const updatedAgo = appt.updatedAt ? Utils.getTimeAgo(appt.updatedAt) : '';

        return `
        <tr>
            <td data-label="Patient">${patientDisplay}</td>
            <td data-label="Date/Time">${dateStr}</td>
            <td data-label="Type">${reasonText}</td>
            <td data-label="Status"><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td data-label="Suggestion">
                <textarea class="suggestion-input" id="sugg_${appt.id}" ${isCancelled ? 'disabled' : ''} placeholder="Add suggestions or notes...">${suggestionText}</textarea>
                ${updatedAgo ? `<div class="text-right mt-1"><small>Last updated: ${updatedAgo}</small></div>` : ''}
            </td>
            <td data-label="Actions">
                <div class="suggestion-actions">
                    <button class="btn btn-primary" ${isCancelled ? 'disabled' : ''} onclick="handleSaveSuggestion('${appt.id}')">Complete Appointment</button>
                </div>
            </td>
        </tr>`;
    }).join('');

    console.log('✅ Rendered', filteredRows.length, 'appointments'); // DEBUG
}

async function renderCompletedAppointments() {
    const tbody = document.getElementById('completedAppointmentsBody');
    if (!tbody) {
        console.error('completedAppointmentsBody element not found');
        return;
    }
    
    // Show loading state
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading completed appointments...</td></tr>';
    
    const searchQuery = document.getElementById('completedSearch')?.value.toLowerCase() || '';
    
    let rows = await getDoctorAppointments();
    
    // Filter only completed appointments
    let completedRows = rows.filter(r => {
        const status = (r.status || 'PENDING').toUpperCase();
        return status === 'COMPLETED';
    });
    
    // Apply search filter
    if (searchQuery) {
        completedRows = completedRows.filter(r => {
            const patientName = r.patientName || (r.patient && (r.patient.username || r.patient.name)) || '';
            return patientName.toLowerCase().includes(searchQuery);
        });
    }
    
    // Sort by most recent first
    completedRows.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.appointmentDate);
        const dateB = new Date(b.updatedAt || b.appointmentDate);
        return dateB - dateA;
    });
    
    console.log('📋 Completed appointments:', completedRows.length); // DEBUG
    
    if (completedRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No completed appointments found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = completedRows.map(appt => {
        const patientName = appt.patientName || (appt.patient && (appt.patient.username || appt.patient.name)) || 'Unknown Patient';
        const patientDisplay = Utils.sanitizeHTML(patientName);
        const reasonText = Utils.sanitizeHTML(appt.reason || 'General Checkup');
        const dateValue = appt.appointmentDate || appt.appointment_date || appt.datetime || appt.date;
        let dateStr = 'N/A';
        if (dateValue) {
            try {
                dateStr = Utils.formatDate(dateValue, 'datetime');
            } catch (e) {
                dateStr = String(dateValue);
            }
        }
        const suggestionText = Utils.sanitizeHTML(appt.doctorNotes || 'No suggestion provided');
        const completedDate = appt.updatedAt ? Utils.formatDate(appt.updatedAt, 'datetime') : 'N/A';
        
        return `
        <tr>
            <td data-label="Patient">${patientDisplay}</td>
            <td data-label="Date/Time">${dateStr}</td>
            <td data-label="Type">${reasonText}</td>
            <td data-label="Suggestion">
                <div class="suggestion-preview">${suggestionText.substring(0, 100)}${suggestionText.length > 100 ? '...' : ''}</div>
            </td>
            <td data-label="Completed On">${completedDate}</td>
        </tr>`;
    }).join('');
    
    console.log('✅ Rendered', completedRows.length, 'completed appointments'); // DEBUG
}

window.handleSaveSuggestion = async function(apptId) {
    const appts = await getDoctorAppointments();
    const appt = appts.find(a => a.id === apptId);
    if (!appt) {
        Utils.showToast('Appointment not found', 'error');
        return;
    }
    
    const textarea = document.getElementById(`sugg_${apptId}`);
    const value = (textarea?.value || '').trim();
    
    if (!value) { 
        Utils.showToast('Please enter a suggestion before completing', 'error'); 
        return; 
    }
    
    // Disable button during processing
    const saveBtn = textarea?.parentElement?.querySelector('button');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Completing...';
    }
    
    try {
        const currentUser = ApiService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            Utils.showToast('Please log in to complete appointments', 'error');
            return;
        }
        
        console.log(`✅ Completing appointment ${apptId} for doctor ${currentUser.id}`);
        
        // Complete the appointment - marks as COMPLETED and saves suggestion
        const response = await ApiService.completeAppointment(apptId, value, currentUser.id);
        console.log('✅ Appointment completed:', response);
        
        Utils.showToast('Appointment completed successfully!', 'success');
        
        // Refresh both pending and completed appointments
        await renderAppointments();
        await renderCompletedAppointments();
        
        // Trigger event to update dashboard statistics if on dashboard page
        window.dispatchEvent(new CustomEvent('appointmentCompleted'));
    } catch (error) {
        console.error('❌ Failed to complete appointment:', error);
        Utils.showToast('Failed to complete appointment. Please try again.', 'error');
    } finally {
        // Re-enable button
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Complete';
        }
    }
}

async function handleSettingsSave(e) {
    e.preventDefault();
    const contact = document.getElementById('contactInput').value.trim();
    const pwd = document.getElementById('passwordInput').value;
    if (!Validator.validatePhone(contact)) { document.getElementById('contactError').textContent = 'Please enter a valid phone number'; return; }
    document.getElementById('contactError').textContent = '';
    if (pwd && !Validator.validatePassword(pwd).valid) { document.getElementById('passwordError').textContent = 'Min 8 chars, include letters and numbers'; return; }
    document.getElementById('passwordError').textContent = '';
    try {
        const current = ApiService.getCurrentUser();
        const updated = {}; if (contact) updated.contact = contact; if (pwd) updated.password = AuthService.hashPassword(pwd);
        await ApiService.request(`/users/${current.id}`, { method: 'PUT', body: JSON.stringify(updated) });
        Utils.showToast('Settings saved', 'success');
        document.getElementById('settingsModal')?.classList.remove('show');
    } catch (e) {
        Utils.showToast('Failed to save settings', 'error');
    }
}

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


