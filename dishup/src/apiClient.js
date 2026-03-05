export const API_BASE_URL = 'http://localhost/DISHUP_S/dishup/api';

// Helper function untuk mengambil token dari session storage atau cookie
const getAuthToken = () => {
    try {
        const sessionStr = localStorage.getItem('supabase.auth.token'); // Menyesuaikan jika masih ada logic lama, 
        // idealnya menggunakan custom logic kita
        if (sessionStr) {
             const session = JSON.parse(sessionStr);
             return session.currentSession?.access_token || null;
        }
        
        // Coba ambil dari localStorage kita sendiri
        return localStorage.getItem('dishup_token');
    } catch {
        return null;
    }
}

export const apiClient = {
    async get(endpoint, params = {}) {
        const url = new URL(`${API_BASE_URL}/${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async post(endpoint, data) {
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
       }
        return await response.json();
    },
    
    async postFormData(endpoint, formData) {
        const token = getAuthToken();
        const headers = {}; // Jangan set Content-Type untuk form-data, browser akan set otomatis
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    async put(endpoint, id, data) {
         const token = getAuthToken();
         const headers = { 'Content-Type': 'application/json' };
         if (token) headers['Authorization'] = `Bearer ${token}`;
 
         const response = await fetch(`${API_BASE_URL}/${endpoint}?id=${id}`, {
             method: 'PUT',
             headers,
             body: JSON.stringify(data)
         });
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
    },

    async delete(endpoint, id) {
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/${endpoint}?id=${id}`, {
            method: 'DELETE',
            headers
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
};
