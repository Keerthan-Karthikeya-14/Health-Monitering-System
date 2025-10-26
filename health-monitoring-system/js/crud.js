// crud.js - CRUD operations for health records
class HealthRecordManager {
    constructor() {
        this.currentUser = StorageService.getCurrentUser();
    }

    // Create a new health record
    createRecord(recordData) {
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        const record = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: this.currentUser.id,
            type: recordData.type,
            value: recordData.value,
            unit: recordData.unit || '',
            date: recordData.date || new Date().toISOString(),
            notes: recordData.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const records = StorageService.getHealthRecords(this.currentUser.id);
        records.unshift(record);
        StorageService.setHealthRecords(this.currentUser.id, records);

        return record;
    }

    // Read all records for current user
    getAllRecords(filters = {}) {
        if (!this.currentUser) {
            return [];
        }

        let records = StorageService.getHealthRecords(this.currentUser.id);

        // Apply filters
        if (filters.type) {
            records = records.filter(r => r.type === filters.type);
        }

        if (filters.startDate) {
            records = records.filter(r => new Date(r.date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            records = records.filter(r => new Date(r.date) <= new Date(filters.endDate));
        }

        // Sort by date (newest first)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        return records;
    }

    // Read a single record by ID
    getRecordById(recordId) {
        if (!this.currentUser) {
            return null;
        }

        const records = StorageService.getHealthRecords(this.currentUser.id);
        return records.find(r => r.id === recordId) || null;
    }

    // Update an existing record
    updateRecord(recordId, updates) {
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        const records = StorageService.getHealthRecords(this.currentUser.id);
        const index = records.findIndex(r => r.id === recordId);

        if (index === -1) {
            throw new Error('Record not found');
        }

        records[index] = {
            ...records[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        StorageService.setHealthRecords(this.currentUser.id, records);
        return records[index];
    }

    // Delete a record
    deleteRecord(recordId) {
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        const records = StorageService.getHealthRecords(this.currentUser.id);
        const filteredRecords = records.filter(r => r.id !== recordId);

        if (records.length === filteredRecords.length) {
            throw new Error('Record not found');
        }

        StorageService.setHealthRecords(this.currentUser.id, filteredRecords);
        return true;
    }

    // Get records by type
    getRecordsByType(type) {
        return this.getAllRecords({ type });
    }

    // Get records for a date range
    getRecordsByDateRange(startDate, endDate) {
        return this.getAllRecords({ startDate, endDate });
    }

    // Get latest record of a specific type
    getLatestRecordByType(type) {
        const records = this.getRecordsByType(type);
        return records.length > 0 ? records[0] : null;
    }

    // Get statistics for a record type
    getRecordStats(type, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const records = this.getRecordsByDateRange(startDate.toISOString(), endDate.toISOString())
            .filter(r => r.type === type);

        if (records.length === 0) {
            return null;
        }

        const values = records.map(r => parseFloat(r.value)).filter(v => !isNaN(v));
        
        return {
            count: values.length,
            average: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            latest: values[0]
        };
    }

    // Export records as JSON
    exportRecordsJSON() {
        const records = this.getAllRecords();
        const dataStr = JSON.stringify(records, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `health-records-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Export records as CSV
    exportRecordsCSV() {
        const records = this.getAllRecords();
        
        if (records.length === 0) {
            return;
        }

        const headers = ['Date', 'Type', 'Value', 'Unit', 'Notes'];
        const csvRows = [headers.join(',')];

        records.forEach(record => {
            const row = [
                new Date(record.date).toLocaleDateString(),
                record.type,
                record.value,
                record.unit,
                `"${record.notes.replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const dataBlob = new Blob([csvString], { type: 'text/csv' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `health-records-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }
}
