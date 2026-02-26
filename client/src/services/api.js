const API_URL = 'http://localhost:3000/api';

const StorageService = {
    KEYS: { CURRENT_USER: 'smms_current_user' },
    get(key, defaultVal) {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultVal));
    },
    set(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

const API = {
    async request(endpoint, method = 'GET', body = null) {
        try {
            const options = { method, headers: {} };
            if (body) {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }
            const res = await fetch(`${API_URL}${endpoint}`, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Server Error');
            return data;
        } catch (e) {
            console.error('API Error:', e);
            throw e;
        }
    }
};

export const AuthService = {
    async login(u, p) {
        const res = await API.request('/auth/login', 'POST', { username: u, password: p });
        if (res.success) {
            StorageService.set(StorageService.KEYS.CURRENT_USER, res.user);
            return res.user;
        }
        throw new Error('Login failed');
    },
    async register(u, p, r, email, sq, sa, section) {
        await API.request('/auth/register', 'POST', { username: u, password: p, role: r, section, email, securityQuestion: sq, securityAnswer: sa });
        return true;
    },
    async verifyUser(u) {
        try {
            return await API.request('/auth/verify', 'POST', { username: u });
        } catch (e) { return { found: false }; }
    },
    async verifySecurity(u, answer, otp, generatedOtp) {
        if (otp && generatedOtp && otp === generatedOtp) return true;
        try {
            const res = await API.request('/auth/verify-security', 'POST', { username: u, answer });
            return res.success;
        } catch (e) { return false; }
    },
    async resetPassword(u, newP) {
        await API.request('/auth/reset', 'POST', { username: u, newPassword: newP });
        return true;
    },
    getCurrentUser() { return StorageService.get(StorageService.KEYS.CURRENT_USER, null); },
    logout() {
        StorageService.remove(StorageService.KEYS.CURRENT_USER);
    }
};

export const DataService = {
    async getSubjects() {
        return await API.request('/subjects');
    },
    async addSubject(name, code, sections) {
        const images = [
            'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=600&q=80'
        ];
        const img = images[Math.floor(Math.random() * images.length)];
        return await API.request('/subjects', 'POST', { name, code, img, sections });
    },
    async removeSubject(id) {
        return await API.request(`/subjects/${id}`, 'DELETE');
    },
    async removeUser(username) {
        return await API.request(`/users/${username}`, 'DELETE');
    },
    async getMaterials() {
        return await API.request('/materials');
    },
    async addMaterial(subId, title, unit, type, category, file) {
        const formData = new FormData();
        formData.append('subjectId', subId);
        formData.append('title', title);
        formData.append('unit', unit);
        formData.append('type', type);
        formData.append('category', category);
        if (file) formData.append('file', file);

        const res = await fetch(`${API_URL}/materials`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server Error');
        return data;
    },
    async trackDownload(matId, title) {
        try {
            const user = AuthService.getCurrentUser();
            const username = user && user.role === 'student' ? user.username : null;
            await API.request(`/materials/${matId}/download`, 'POST', { username, title });
        } catch (e) { console.error('Failed to track download', e); }
    },
    async getStats() {
        try {
            return await API.request('/stats');
        } catch (e) {
            return { users: 0, materials: 0, userList: [] };
        }
    },
    async getStudentActivity(username) {
        try {
            return await API.request(`/users/${username}/downloads`);
        } catch (e) {
            return [];
        }
    }
};
