// charts.js
class HealthCharts {
    static init() {
        if (!document.querySelector('.charts-container')) return;

        this.initHeartRateChart();
        this.initBloodPressureChart();
        this.initActivityChart();
    }

    static initHeartRateChart() {
        const ctx = document.getElementById('heartRateChart');
        if (!ctx) return;

        // Sample data (in a real app, this would come from your data service)
        const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        const data = Array.from({length: 24}, () => Math.floor(Math.random() * 30) + 60); // Random heart rates between 60-90

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Heart Rate (bpm)',
                    data: data,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#FF6B6B',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#FF6B6B',
                    pointHoverBorderColor: '#fff',
                    pointHitRadius: 10,
                    pointBorderWidth: 2
                }]
            },
            options: this.getChartOptions('Heart Rate Over 24 Hours')
        });
    }

    static initBloodPressureChart() {
        const ctx = document.getElementById('bloodPressureChart');
        if (!ctx) return;

        // Sample data
        const labels = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const systolic = Array.from({length: 7}, () => Math.floor(Math.random() * 20) + 110); // 110-130
        const diastolic = Array.from({length: 7}, () => Math.floor(Math.random() * 15) + 65); // 65-80

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Systolic',
                        data: systolic,
                        borderColor: '#4D96FF',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Diastolic',
                        data: diastolic,
                        borderColor: '#6BCB77',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                ...this.getChartOptions('Blood Pressure Trend'),
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        max: 150,
                        title: {
                            display: true,
                            text: 'mmHg'
                        }
                    }
                }
            }
        });
    }

    static initActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        // Sample data
        const labels = ['Steps', 'Calories', 'Active Minutes'];
        const data = [
            Math.floor(Math.random() * 5000) + 3000, // 3000-8000 steps
            Math.floor(Math.random() * 300) + 200,   // 200-500 calories
            Math.floor(Math.random() * 120) + 30     // 30-150 minutes
        ];

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Today\'s Activity',
                    data: data,
                    backgroundColor: [
                        'rgba(77, 150, 255, 0.7)',
                        'rgba(255, 107, 107, 0.7)',
                        'rgba(107, 255, 150, 0.7)'
                    ],
                    borderColor: [
                        'rgba(77, 150, 255, 1)',
                        'rgba(255, 107, 107, 1)',
                        'rgba(107, 255, 150, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                ...this.getChartOptions('Daily Activity'),
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    static getChartOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: !!title,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 4,
                    displayColors: true,
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                line: {
                    tension: 0.3
                }
            },
            animation: {
                duration: 1000
            }
        };
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    HealthCharts.init();
});