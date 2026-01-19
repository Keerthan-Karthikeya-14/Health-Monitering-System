// dashboard.js - Dashboard page logic
let recordManager;

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication via ApiService cookie
    const currentUser = ApiService.getCurrentUser();
    if (!currentUser) {
        window.location.href = '../login.html';
        return;
    }

    recordManager = new HealthRecordManager({ api: ApiService, user: currentUser });
    await initializeDashboard();
});

async function initializeDashboard() {
    loadUserData();
    initDateDisplay();
    await loadHealthMetrics();
    await loadRecentRecords(); // Enabled - now fetches real data
    // Charts moved to reports page
    setupEventListeners();
}

function loadUserData() {
    const user = ApiService.getCurrentUser();
    if (!user) return;

    // Update greeting
    const greeting = Utils.getGreeting();
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        greetingElement.innerHTML = `${greeting}, <span id="userName">${user.username}</span>! 👋`;
    }

    // Update user initials
    const initials = user.username.split(' ').map(n => n[0]).join('').toUpperCase();
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

async function loadHealthMetrics() {
    try {
        const records = await recordManager.getAllRecords();
        
        // Calculate metrics from records
        const metrics = calculateMetricsFromRecords(records);
        
        // Update UI
        const heartRateEl = document.getElementById('heartRate');
        if (heartRateEl) {
            heartRateEl.innerHTML = `<span>${metrics.avgHeartRate || 'N/A'}</span> <span>BPM</span>`;
        }
        
        const bloodPressureEl = document.getElementById('bloodPressure');
        if (bloodPressureEl) {
            bloodPressureEl.innerHTML = `<span>${metrics.avgBp || 'N/A'}</span> <span>mmHg</span>`;
        }
        
        const stepsEl = document.getElementById('steps');
        if (stepsEl) {
            stepsEl.innerHTML = `<span>${records.length}</span> <span>records</span>`;
        }
        
        // Calculate and display health score
        const healthScore = calculateHealthScore(metrics, records.length);
        const scoreEl = document.getElementById('healthScore');
        if (scoreEl) {
            scoreEl.textContent = healthScore;
        }
        
    } catch (error) {
        console.error('Error loading health metrics:', error);
        // Fallback to N/A
        const heartRateEl = document.getElementById('heartRate');
        if (heartRateEl) {
            heartRateEl.innerHTML = `<span>N/A</span> <span>BPM</span>`;
        }
        const bloodPressureEl = document.getElementById('bloodPressure');
        if (bloodPressureEl) {
            bloodPressureEl.innerHTML = `<span>N/A</span> <span>mmHg</span>`;
        }
        const stepsEl = document.getElementById('steps');
        if (stepsEl) {
            stepsEl.innerHTML = `<span>0</span> <span>records</span>`;
        }
        const scoreEl = document.getElementById('healthScore');
        if (scoreEl) {
            scoreEl.textContent = 'N/A';
        }
    }
}


function calculateMetricsFromRecords(records) {
    if (!records || records.length === 0) {
        return { avgHeartRate: null, avgBp: null };
    }
    
    let totalHeartRate = 0;
    let heartRateCount = 0;
    let totalSystolic = 0;
    let totalDiastolic = 0;
    let bpCount = 0;
    
    records.forEach(record => {
        if (record.heartRate) {
            totalHeartRate += record.heartRate;
            heartRateCount++;
        }
        if (record.systolicBp && record.diastolicBp) {
            totalSystolic += record.systolicBp;
            totalDiastolic += record.diastolicBp;
            bpCount++;
        }
    });
    
    const avgHeartRate = heartRateCount > 0 ? Math.round(totalHeartRate / heartRateCount) : null;
    const avgSystolic = bpCount > 0 ? Math.round(totalSystolic / bpCount) : null;
    const avgDiastolic = bpCount > 0 ? Math.round(totalDiastolic / bpCount) : null;
    const avgBp = avgSystolic && avgDiastolic ? `${avgSystolic}/${avgDiastolic}` : null;
    
    return { avgHeartRate, avgBp };
}

function calculateHealthScore(metrics, recordCount) {
    if (!metrics.avgHeartRate && !metrics.avgBp && recordCount === 0) {
        return 'N/A';
    }
    
    let score = 50; // Base score
    
    // Heart rate score (normal: 60-100)
    if (metrics.avgHeartRate) {
        if (metrics.avgHeartRate >= 60 && metrics.avgHeartRate <= 100) {
            score += 20;
        } else if (metrics.avgHeartRate >= 50 && metrics.avgHeartRate <= 110) {
            score += 10;
        } else {
            score -= 10;
        }
    }
    
    // Blood pressure score (normal: <120/80)
    if (metrics.avgBp) {
        const [sys, dia] = metrics.avgBp.split('/').map(Number);
        if (sys < 120 && dia < 80) {
            score += 20;
        } else if (sys < 140 && dia < 90) {
            score += 10;
        } else {
            score -= 10;
        }
    }
    
    // Record count bonus
    score += Math.min(recordCount * 2, 20);
    
    return Math.max(0, Math.min(100, score));
}
    
    // Adjust based on blood pressure (normal: 120/80)
    if (summary.latestSystolicBp && summary.latestDiastolicBp) {
        if (summary.latestSystolicBp <= 120 && summary.latestDiastolicBp <= 80) {
            score += 5;
        } else if (summary.latestSystolicBp > 140 || summary.latestDiastolicBp > 90) {
            score -= 10;
        }
    }
    
    return Math.max(0, Math.min(100, score));


function calculateHealthScore(records) {
    let score = 70;
    
    if (records.length > 0) {
        score += Math.min(records.length * 2, 20);
    }
    
    if (records.length >= 10) score += 10;
    
    return Math.min(100, score);
}

async function loadRecentRecords() {
    try {
        const records = await recordManager.getAllRecords();
        const tbody = document.getElementById('recordsTableBody');
        if (!tbody) return;
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No health records found. Add your first record!</td></tr>';
            return;
        }
        
        tbody.innerHTML = records.slice(0, 5).map(record => `
            <tr>
                <td>${Utils.formatDate(record.recordDate || record.date)}</td>
                <td>${record.recordType || record.type || 'General'}</td>
                <td>${record.heartRate || 'N/A'} BPM</td>
                <td>${record.systolicBp && record.diastolicBp ? `${record.systolicBp}/${record.diastolicBp}` : 'N/A'}</td>
                <td>${record.symptoms || record.notes || 'N/A'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading recent records:', error);
        const tbody = document.getElementById('recordsTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-error">Error loading records</td></tr>';
        }
    }
}

function formatRecordType(type) {
    return type ? type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';
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
    
    // Chart period and download button moved to reports page
}

async function generatePDFReport() {
    // Disabled - no backend support for PDF report generation
    Utils.showToast('PDF report generation disabled - authentication only system', 'info');
}

function openAddRecordModal() {
    document.getElementById('addRecordModal').classList.add('show');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

async function handleAddRecord(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const recordData = {
        // Original frontend field for type (now mapped to recordType from form)
        type: formData.get('recordType'), 
        value: formData.get('value'),
        unit: formData.get('unit'),
        date: new Date().toISOString(),
        notes: formData.get('notes'),
        // Removed the duplicate 'recordType' mapping as 'type' now serves this purpose
    };

    if (!recordData.type) {
        Utils.showToast('Please select a record type.', 'warning');
        return;
    }

    try {
        await recordManager.createRecord(recordData);
        Utils.showToast('Record added successfully', 'success');
        await loadRecentRecords();
        await loadHealthMetrics();
        closeModals();
        e.target.reset();
    } catch (error) {
        Utils.showToast(error.message, 'error');
    }
}

function editRecord(id) {
    Utils.showToast('Edit functionality available in My Records page', 'info');
}

async function deleteRecord(id) {
    if (confirm('Delete this record?')) {
        try {
            await recordManager.deleteRecord(id);
            Utils.showToast('Record deleted', 'success');
            await loadRecentRecords();
            await loadHealthMetrics();
            await initializeCharts(); // Refresh charts
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    }
}

// Chart instances
let heartRateChart = null;
let recordDistributionChart = null;
let monthlyActivityChart = null;

async function initializeCharts() {
    const currentUser = ApiService.getCurrentUser();
    if (!currentUser || !currentUser.id) return;
    
    const period = parseInt(document.getElementById('chartPeriod')?.value || '30');
    
    try {
        const healthData = await ApiService.getHealthData(currentUser.id, period);
        console.log('📈 Health Data for charts:', healthData);
        
        // Initialize Heart Rate Chart
        initHeartRateChart(healthData.heartRateData || []);
        
        // Initialize Record Distribution Chart
        initRecordDistributionChart(healthData.recordDistribution || {});
        
        // Initialize Monthly Activity Chart
        initMonthlyActivityChart(healthData.monthlyActivity || {});
        
    } catch (error) {
        console.error('❌ Failed to load health data for charts:', error);
        showChartEmptyStates();
    }
}

function initHeartRateChart(data) {
    const ctx = document.getElementById('heartRateChart');
    if (!ctx) return;
    
    const emptyState = document.getElementById('heartRateEmpty');
    
    if (!data || data.length === 0) {
        ctx.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    ctx.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    // Destroy existing chart if it exists
    if (heartRateChart) {
        heartRateChart.destroy();
    }
    
    const labels = data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }).reverse();
    
    const values = data.map(d => d.value).reverse();
    
    heartRateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Heart Rate (BPM)',
                data: values,
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { 
                    beginAtZero: false,
                    grid: { color: '#E2E8F0' },
                    ticks: { stepSize: 10 }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function initRecordDistributionChart(distribution) {
    const ctx = document.getElementById('recordDistributionChart');
    if (!ctx) return;
    
    const emptyState = document.getElementById('distributionEmpty');
    
    if (!distribution || Object.keys(distribution).length === 0) {
        ctx.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    ctx.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    if (recordDistributionChart) {
        recordDistributionChart.destroy();
    }
    
    const labels = Object.keys(distribution).map(key => 
        key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    );
    const values = Object.values(distribution);
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    
    recordDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true }
            }
        }
    });
}

function initMonthlyActivityChart(activity) {
    const ctx = document.getElementById('monthlyActivityChart');
    if (!ctx) return;
    
    const emptyState = document.getElementById('activityEmpty');
    
    if (!activity || Object.keys(activity).length === 0) {
        ctx.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    ctx.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    if (monthlyActivityChart) {
        monthlyActivityChart.destroy();
    }
    
    // Sort by date
    const sortedEntries = Object.entries(activity).sort((a, b) => a[0].localeCompare(b[0]));
    const labels = sortedEntries.map(([month]) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, parseInt(monthNum) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    const values = sortedEntries.map(([, count]) => count);
    
    monthlyActivityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Records',
                data: values,
                backgroundColor: '#4ECDC4',
                borderColor: '#45B7D1',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: '#E2E8F0' },
                    ticks: { stepSize: 1 }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function showChartEmptyStates() {
    document.getElementById('heartRateEmpty')?.style.setProperty('display', 'flex');
    document.getElementById('distributionEmpty')?.style.setProperty('display', 'flex');
    document.getElementById('activityEmpty')?.style.setProperty('display', 'flex');
}