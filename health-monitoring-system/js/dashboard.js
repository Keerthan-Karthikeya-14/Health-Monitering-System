// dashboard.js - Dashboard page logic
let recordManager;

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = '../auth/login.html';
        return;
    }

    recordManager = new HealthRecordManager();
    initializeDashboard();
});

function initializeDashboard() {
    loadUserData();
    initDateDisplay();
    loadHealthMetrics();
    loadRecentRecords();
    setupEventListeners();
}

function loadUserData() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) return;

    // Update greeting
    const greeting = Utils.getGreeting();
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        greetingElement.innerHTML = `${greeting}, <span id="userName">${user.name}</span>! 👋`;
    }

    // Update user initials
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const userInitialsElement = document.getElementById('userInitials');
    if (userInitialsElement) {
        userInitialsElement.textContent = initials;
    }
}

function initDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = Utils.formatDate(new Date(), 'long');
    }
}

function loadHealthMetrics() {
    const records = recordManager.getAllRecords();
    
    // Update health score
    const score = calculateHealthScore(records);
    const scoreElement = document.getElementById('scoreValue');
    const scoreCircle = document.getElementById('scoreCircle');
    
    if (scoreElement) {
        scoreElement.textContent = score;
    }
    
    if (scoreCircle) {
        const circumference = 283;
        const offset = circumference - (score / 100) * circumference;
        scoreCircle.style.strokeDashoffset = offset;
    }
}

function calculateHealthScore(records) {
    let score = 70;
    
    if (records.length > 0) {
        score += Math.min(records.length * 2, 20);
    }
    
    if (records.length >= 10) score += 10;
    
    return Math.min(100, score);
}

function loadRecentRecords() {
    const records = recordManager.getAllRecords().slice(0, 5);
    const tbody = document.getElementById('recordsTableBody');
    
    if (!tbody) return;

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No records found. Add your first health record!</td></tr>';
        return;
    }

    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${Utils.formatDate(record.date, 'short')}</td>
            <td>${formatRecordType(record.type)}</td>
            <td>${record.value} ${record.unit || ''}</td>
            <td>${record.notes || '-'}</td>
            <td>
                <button class="btn-icon-sm" onclick="editRecord('${record.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon-sm" onclick="deleteRecord('${record.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function formatRecordType(type) {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function setupEventListeners() {
    // FAB button
    const fabBtn = document.getElementById('addRecordFab');
    if (fabBtn) {
        fabBtn.addEventListener('click', openAddRecordModal);
    }

    // Add record form
    const addRecordForm = document.getElementById('addRecordForm');
    if (addRecordForm) {
        addRecordForm.addEventListener('submit', handleAddRecord);
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
        });
    }

    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('show');
        });
    }

    // User menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            document.getElementById('userDropdown').classList.toggle('show');
        });
    }
}

function openAddRecordModal() {
    document.getElementById('addRecordModal').classList.add('show');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function handleAddRecord(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const recordData = {
        type: formData.get('type'),
        value: formData.get('value'),
        unit: formData.get('unit'),
        date: new Date().toISOString(),
        notes: formData.get('notes')
    };

    try {
        recordManager.createRecord(recordData);
        Utils.showToast('Record added successfully', 'success');
        loadRecentRecords();
        loadHealthMetrics();
        closeModals();
        e.target.reset();
    } catch (error) {
        Utils.showToast(error.message, 'error');
    }
}

function editRecord(id) {
    Utils.showToast('Edit functionality available in My Records page', 'info');
}

function deleteRecord(id) {
    if (confirm('Delete this record?')) {
        try {
            recordManager.deleteRecord(id);
            Utils.showToast('Record deleted', 'success');
            loadRecentRecords();
            loadHealthMetrics();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    }
}