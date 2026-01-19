// data.js
const MockData = {
    // Mock user data
    users: [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123', // In a real app, this would be hashed
            age: 35,
            gender: 'male',
            createdAt: new Date().toISOString()
        }
    ],

    // Mock health records
    healthRecords: [
        {
            id: '1',
            userId: '1',
            type: 'heart_rate',
            value: 72,
            unit: 'bpm',
            notes: 'Resting heart rate',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            userId: '1',
            type: 'blood_pressure',
            value: { systolic: 120, diastolic: 80 },
            unit: 'mmHg',
            notes: 'Morning reading',
            createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
        }
    ],

    // Mock health tips
    healthTips: [
        'Drink at least 8 glasses of water daily.',
        'Aim for 7-9 hours of sleep each night.',
        'Take a 5-minute break every hour if you sit for long periods.',
        'Practice deep breathing exercises to reduce stress.',
        'Aim for at least 150 minutes of moderate exercise per week.'
    ],

    // Mock notifications
    notifications: [
        {
            id: '1',
            userId: '1',
            title: 'Medication Reminder',
            message: 'Time to take your multivitamin',
            type: 'reminder',
            read: false,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            userId: '1',
            title: 'Appointment Tomorrow',
            message: 'You have a doctor\'s appointment tomorrow at 2:00 PM',
            type: 'appointment',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        }
    ],

    // Get a random health tip
    getRandomTip() {
        return this.healthTips[Math.floor(Math.random() * this.healthTips.length)];
    },

    // Generate mock health data
    generateMockHealthData(days = 30) {
        const data = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                heartRate: Math.floor(Math.random() * 20) + 65, // 65-85 bpm
                systolic: Math.floor(Math.random() * 20) + 110, // 110-130
                diastolic: Math.floor(Math.random() * 15) + 65, // 65-80
                steps: Math.floor(Math.random() * 5000) + 3000, // 3000-8000 steps
                calories: Math.floor(Math.random() * 500) + 1500, // 1500-2000 calories
                sleep: Math.floor(Math.random() * 3) + 6 // 6-9 hours
            });
        }
        
        return data;
    }
};

// Initialize mock data if localStorage is empty
function initializeMockData() {
    if (!localStorage.getItem('healthAppUsers') || JSON.parse(localStorage.getItem('healthAppUsers')).length === 0) {
        localStorage.setItem('healthAppUsers', JSON.stringify(MockData.users));
    }
    
    if (!localStorage.getItem('healthRecords_1')) {
        localStorage.setItem('healthRecords_1', JSON.stringify(MockData.healthRecords));
    }
}

// Initialize when the script loads
document.addEventListener('DOMContentLoaded', initializeMockData);