// crud.js - CRUD operations for health records
class HealthRecordManager {
    constructor(opts = {}) {
        this.api = opts.api || ApiService;
        this.currentUser = opts.user || this.api.getCurrentUser();
    }

    // Create a new health record
    async createRecord(recordData) {
        if (!this.currentUser) throw new Error('User not authenticated');

        // Check if this is a new schema record (has health metrics or new fields)
        const hasHealthMetrics = recordData.heartRate !== undefined || 
                                recordData.systolicBp !== undefined || 
                                recordData.diastolicBp !== undefined;
        const isV2 = hasHealthMetrics ||
                    recordData.recordType !== undefined ||
                    recordData.diagnosis !== undefined ||
                    recordData.doctorName !== undefined ||
                    recordData.prescription !== undefined ||
                    recordData.testResults !== undefined;

        // Use new endpoint that supports health metrics
        if (isV2 && this.api.createRecordV2) {
            const payloadV2 = {
                patientId: this.currentUser.id,
                recordType: recordData.recordType || recordData.type,
                recordDate: recordData.date || new Date().toISOString(),
                symptoms: recordData.symptoms || recordData.notes || '',
                diagnosis: recordData.diagnosis || recordData.value || '',
                heartRate: recordData.heartRate ? parseInt(recordData.heartRate) : null,
                systolicBp: recordData.systolicBp ? parseInt(recordData.systolicBp) : null,
                diastolicBp: recordData.diastolicBp ? parseInt(recordData.diastolicBp) : null,
                // Legacy fields for backward compatibility
                type: recordData.type || recordData.recordType,
                value: recordData.value || '',
                unit: recordData.unit || '',
                notes: recordData.notes || recordData.symptoms || ''
            };
            console.log('📝 Creating record with payload:', payloadV2);
            return this.api.createRecordV2(payloadV2);
        }

        // Legacy payload fallback
        const payload = {
            type: recordData.type,
            value: recordData.value,
            unit: recordData.unit || '',
            date: recordData.date || new Date().toISOString(),
            notes: recordData.notes || ''
        };
        return this.api.createHealthRecord(this.currentUser.id, payload);
    }

    // Read all records for current user
    async getAllRecords(filters = {}) {
        if (!this.currentUser) return [];
        let records;
        try {
            console.log('🔍 Fetching records for user:', this.currentUser.id);
            // Use the new V2 endpoint that returns proper DTOs
            if (this.api.getUserRecordsV2) {
                records = await this.api.getUserRecordsV2(this.currentUser.id);
                console.log('✅ Fetched records from V2 endpoint:', records);
            } else {
                // Fallback to legacy endpoint
                records = await this.api.getHealthRecords(this.currentUser.id);
                console.log('✅ Fetched records from legacy endpoint:', records);
            }
        } catch (e) {
            console.error('❌ Error fetching records:', e);
            return [];
        }

        // Ensure records is an array
        if (!Array.isArray(records)) {
            console.warn('⚠️ Records is not an array:', records);
            return [];
        }

        console.log(`📋 Total records fetched: ${records.length}`);

        // Apply filters client-side if provided
        if (filters.type) records = records.filter(r => r.type === filters.type || r.recordType === filters.type);
        if (filters.startDate) records = records.filter(r => new Date(r.date || r.recordDate) >= new Date(filters.startDate));
        if (filters.endDate) records = records.filter(r => new Date(r.date || r.recordDate) <= new Date(filters.endDate));

        // Sort by date (handle both date and recordDate fields)
        records.sort((a, b) => {
            const dateA = new Date(a.date || a.recordDate);
            const dateB = new Date(b.date || b.recordDate);
            return dateB - dateA;
        });
        
        return records;
    }

    // Read a single record by ID
    async getRecordById(recordId) {
        // Prefer explicit API helper when available
        if (this.api.getHealthRecordById) return this.api.getHealthRecordById(recordId);
        return this.api.request(`/records/${recordId}`);
    }

    // Update an existing record
    async updateRecord(recordId, updates) {
        if (this.api.updateHealthRecord) return this.api.updateHealthRecord(recordId, updates);
        return this.api.request(`/records/${recordId}`, { method: 'PATCH', body: JSON.stringify(updates) });
    }

    // Delete a record
    async deleteRecord(recordId) {
        return this.api.deleteHealthRecord ? this.api.deleteHealthRecord(recordId) : this.api.request(`/records/${recordId}`, { method: 'DELETE' });
    }

    // Get records by type
    async getRecordsByType(type) { return this.getAllRecords({ type }); }

    // Get records for a date range
    async getRecordsByDateRange(startDate, endDate) { return this.getAllRecords({ startDate, endDate }); }

    // Get latest record of a specific type
    async getLatestRecordByType(type) {
        const records = await this.getRecordsByType(type);
        return records.length > 0 ? records[0] : null;
    }

    // Get statistics for a record type
    async getRecordStats(type, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const records = (await this.getRecordsByDateRange(startDate.toISOString(), endDate.toISOString())).filter(r => r.type === type);
        if (records.length === 0) return null;
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
    async exportRecordsJSON() {
        const records = await this.getAllRecords();
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
    async exportRecordsCSV() {
        const records = await this.getAllRecords();
        
        if (records.length === 0) {
            return;
        }

        const isV2 = records.length > 0 && (records[0].diagnosis !== undefined || records[0].doctorName !== undefined);
        const headers = isV2
            ? ['Date', 'Doctor', 'Diagnosis', 'Prescription', 'Test Results', 'Notes']
            : ['Date', 'Type', 'Value', 'Unit', 'Notes'];
        const csvRows = [headers.join(',')];

        records.forEach(record => {
            const safe = v => (v === null || v === undefined ? '' : String(v));
            const esc = v => `"${safe(v).replace(/"/g, '""')}"`;
            const dateStr = new Date(record.date).toLocaleDateString();
            if (isV2) {
                const row = [
                    dateStr,
                    safe(record.doctorName),
                    safe(record.diagnosis),
                    safe(record.prescription),
                    safe(record.testResults),
                    esc(record.notes)
                ];
                csvRows.push(row.join(','));
            } else {
                const row = [
                    dateStr,
                    safe(record.type),
                    safe(record.value),
                    safe(record.unit),
                    esc(record.notes)
                ];
                csvRows.push(row.join(','));
            }
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
