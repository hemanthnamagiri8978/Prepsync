/**
 * PrepSync - App Controller
 * Handles logic for the new Dark Glass theme and features.
 */

// --- 1. Toast Notification System ---
const Toast = {
    container: null,
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.position = 'fixed';
            this.container.style.top = '20px';
            this.container.style.right = '20px';
            this.container.style.zIndex = '1000';
            this.container.style.display = 'flex';
            this.container.style.flexDirection = 'column';
            this.container.style.gap = '10px';
            document.body.appendChild(this.container);
        }
    },
    show(message, type = 'info') {
        if (!this.container) this.init();
        const toast = document.createElement('div');

        // Toast Styling
        toast.style.background = 'rgba(15, 23, 42, 0.9)';
        toast.style.backdropFilter = 'blur(12px)';
        toast.style.border = '1px solid rgba(255,255,255,0.1)';
        toast.style.borderLeft = `4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'}`;
        toast.style.color = 'white';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '12px';
        toast.style.minWidth = '300px';
        toast.style.transform = 'translateX(120%)';
        toast.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        toast.style.fontFamily = "'Inter', sans-serif";
        toast.style.fontSize = '0.9rem';

        const icon = type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle';
        toast.innerHTML = `<ion-icon name="${icon}" style="font-size: 1.2rem; color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};"></ion-icon> <span>${message}</span>`;

        this.container.appendChild(toast);

        // Animate
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)');

        // Remove
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); }
};

// --- 2. API & Auth Services ---
const API_URL = 'http://localhost:3000/api';

const StorageService = {
    KEYS: { CURRENT_USER: 'smms_current_user' },
    get(key, defaultVal) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultVal)); },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
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

const AuthService = {
    async loginCallback(u, p) {
        try {
            const res = await API.request('/auth/login', 'POST', { username: u, password: p });
            if (res.success) {
                StorageService.set(StorageService.KEYS.CURRENT_USER, res.user);
                Toast.success('Welcome back, ' + res.user.username);
                setTimeout(() => window.location.href = 'dashboard.html', 800);
            }
        } catch (e) { Toast.error(e.message); }
    },
    async register(u, p, r, email, sq, sa, section) {
        try {
            await API.request('/auth/register', 'POST', { username: u, password: p, role: r, section, email, securityQuestion: sq, securityAnswer: sa });
            Toast.success('Account created! Please login.');
            return true;
        } catch (e) {
            Toast.error(e.message);
            return false;
        }
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
        try {
            await API.request('/auth/reset', 'POST', { username: u, newPassword: newP });
            Toast.success('Password updated successfully');
            return true;
        } catch (e) {
            Toast.error('Failed to reset password');
            return false;
        }
    },
    getCurrentUser() { return StorageService.get(StorageService.KEYS.CURRENT_USER, null); },
    logout() {
        localStorage.removeItem(StorageService.KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    }
};

// --- 3. Data Service ---
const DataService = {
    async getSubjects() {
        return await API.request('/subjects');
    },
    async addSubject(name, code, sections) {
        try {
            const images = [
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=600&q=80'
            ];
            const img = images[Math.floor(Math.random() * images.length)];
            await API.request('/subjects', 'POST', { name, code, img, sections });
            Toast.success(`Subject ${code} created`);
        } catch (e) { Toast.error('Failed to create subject'); }
    },
    async removeSubject(id) {
        try {
            await API.request(`/subjects/${id}`, 'DELETE');
            Toast.info('Subject deleted');
        } catch (e) { Toast.error('Failed to delete subject'); }
    },
    async removeUser(username) {
        try {
            await API.request(`/users/${username}`, 'DELETE');
            Toast.success(`User deleted`);
        } catch (e) { Toast.error(e.message || 'Failed to delete user'); }
    },
    async getMaterials() {
        return await API.request('/materials');
    },
    async addMaterial(subId, title, unit, type, category) {
        try {
            await API.request('/materials', 'POST', { subjectId: subId, title, unit, type, category });
            Toast.success('Material uploaded');
        } catch (e) { Toast.error('Failed to upload material'); }
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


// --- 4. UI Rendering & Logic ---

// Tab Switching Logic
window.switchTab = function (tabName) {
    console.log("Switching to tab:", tabName);
    // 1. Update Sidebar/Navbar Links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    // Find link that calls this function with this tabName
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(l => l.getAttribute('onclick')?.includes(tabName));
    if (activeLink) activeLink.classList.add('active');

    // 2. toggle Views
    document.querySelectorAll('.content-view').forEach(v => v.classList.add('hidden'));

    const viewId = `view-${tabName}`;
    const viewEl = document.getElementById(viewId);
    if (viewEl) {
        viewEl.classList.remove('hidden');
    } else {
        // Fallback or feature not implemented
        Toast.info(`Module '${tabName}' is currently under development.`);
    }

    // 3. Toggle Hero Section visibility
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        if (tabName === 'dashboard' || tabName === 'subjects') {
            heroSection.style.display = 'block';
        } else {
            heroSection.style.display = 'none';
        }
    }
};

async function renderSubjects(user) {
    const grid = document.getElementById('subjectsGrid');
    if (!grid) return;

    try {
        let subjects = await DataService.getSubjects();

        // Filter by Section for Students AND Faculty
        if ((user.role === 'student' || user.role === 'faculty') && user.section && user.section !== 'all') {
            subjects = subjects.filter(s => s.sections && s.sections.includes(user.section));
        }

        const filter = document.getElementById('searchSubject')?.value.toLowerCase() || '';

        if (filter) subjects = subjects.filter(s => s.name.toLowerCase().includes(filter) || s.code.toLowerCase().includes(filter));

        if (subjects.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No subjects found.</div>`;
            return;
        }

        const allMaterials = await DataService.getMaterials();
        const stats = await DataService.getStats();
        const allUsers = stats.userList || [];

        grid.innerHTML = subjects.map(sub => {
            const fileCount = allMaterials.filter(m => m.subjectId === sub.id).length;
            const studentCount = allUsers.filter(u => u.role === 'student' && u.section && sub.sections && sub.sections.includes(u.section)).length;
            return `
            <div class="subject-card glass-panel">
                <div class="subject-cover" style="background-image: url('${sub.img}');">
                    <div style="position: absolute; top: 12px; left: 12px;">
                        <span class="badge badge-blue">${sub.code}</span>
                    </div>
                     ${(user.role === 'admin' || user.role === 'faculty') ?
                    `<button onclick="deleteSubject(event, ${sub.id})" class="icon-btn" style="position: absolute; top: 12px; right: 12px; width: 30px; height: 30px; background: rgba(0,0,0,0.6); color: #ef4444;"><ion-icon name="trash-outline"></ion-icon></button>`
                    : ''}
                </div>
                <div class="subject-info">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                         <h4 style="font-size: 1.1rem; margin:0;">${sub.name}</h4>
                         <span style="font-size: 0.7rem; color: var(--accent); background: rgba(56, 189, 248, 0.1); padding: 2px 6px; border-radius: 4px;">${sub.schedule || 'TBA'}</span>
                    </div>
                    <div style="display: flex; gap: 10px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
                        <span><ion-icon name="document-text-outline" style="vertical-align: middle;"></ion-icon> ${fileCount} Files</span>
                        <span><ion-icon name="people-outline" style="vertical-align: middle;"></ion-icon> ${studentCount} Students</span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary" style="flex: 1; padding: 8px; justify-content: center;" onclick="openSubject(${sub.id})">Open</button>
                        ${(user.role === 'admin' || user.role === 'faculty') ?
                    `<button class="btn btn-ghost" style="padding: 8px;" onclick="openUploadModal(${sub.id})"><ion-icon name="cloud-upload-outline"></ion-icon></button>`
                    : ''}
                    </div>
                </div>
            </div>
        `}).join('');
    } catch (e) { console.error(e); }
}

async function renderAdminStats() {
    const stats = await DataService.getStats();
    const uEl = document.getElementById('statUsers');
    const mEl = document.getElementById('statMaterials');
    if (uEl) uEl.textContent = stats.users;
    if (mEl) mEl.textContent = stats.materials;

    const tbody = document.getElementById('userTableBody');
    if (tbody) {
        const users = stats.userList || [];
        tbody.innerHTML = users.map(u => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 16px 20px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                        ${u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span style="font-weight: 600; font-size: 0.95rem;">${u.username}</span>
                </td>
                <td style="padding: 16px 20px;">
                    <span style="padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: ${u.role === 'admin' ? 'rgba(168, 85, 247, 0.15)' : u.role === 'faculty' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.1)'}; color: ${u.role === 'admin' ? '#d8b4fe' : u.role === 'faculty' ? '#7dd3fc' : '#cbd5e1'}; border: 1px solid ${u.role === 'admin' ? 'rgba(168, 85, 247, 0.3)' : u.role === 'faculty' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.1)'};">
                        ${u.role}
                    </span>
                </td>
                <td style="padding: 16px 20px;">
                    <div style="display: flex; align-items: center; gap: 6px; color: #10b981; font-size: 0.85rem; font-weight: 600;">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></div> Active
                    </div>
                </td>
                <td style="padding: 16px 20px; text-align: right;">
                    ${u.role !== 'admin' ?
                `<button style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'" onclick="deleteUser(event, '${u.username}')">
                            <ion-icon name="ban-outline"></ion-icon>
                        </button>`
                : '<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Protected</span>'}
                </td>
            </tr>
        `).join('');
    }
}

function generateMaterialCardHTML(m, allSubjects, badgeText, badgeColor) {
    const sub = allSubjects.find(s => s.id === m.subjectId) || { code: 'VAR' };
    return `
        <div class="glass-panel" style="padding: 20px; border-left: 4px solid ${badgeColor}; cursor: pointer; transition: transform 0.2s;" onclick="Toast.info('Previewing document...')">
            <div style="font-size: 0.8rem; color: ${badgeColor}; font-weight: 700; margin-bottom: 5px;">${badgeText}</div>
            <h4 style="margin-bottom: 5px;">${m.title}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 15px;">${sub.code} • ${m.downloads || 0} Downloads</p>
            <button class="btn btn-ghost" style="width: 100%; justify-content: center; font-size: 0.85rem;">View Document</button>
        </div>
    `;
}

async function renderDashboardStats() {
    const materials = await DataService.getMaterials();
    const stats = await DataService.getStats();
    let subjects = [];
    try { subjects = await DataService.getSubjects(); } catch (e) { }

    const activeStudents = stats.userList.filter(u => u.role === 'student').length;
    const totalDownloads = materials.reduce((acc, m) => acc + (m.downloads || 0), 0);

    const tmEl = document.getElementById('dashTotalMaterials');
    const tdEl = document.getElementById('dashTotalDownloads');
    const asEl = document.getElementById('dashActiveStudents');

    if (tmEl) tmEl.textContent = materials.length;
    if (tdEl) tdEl.textContent = totalDownloads;
    if (asEl) asEl.textContent = activeStudents;

    const topContribEl = document.getElementById('topContributors');
    if (topContribEl && stats.topDownloaders) {
        const topHtml = stats.topDownloaders.map(u => `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 32px; height: 32px; background: #c084fc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem;">
                        ${u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span style="font-size: 0.9rem; font-weight: 500;">${u.username}</span>
                </div>
                <span class="badge badge-blue">${u.count} Downloads</span>
            </div>
        `).join('');
        topContribEl.innerHTML = topHtml || '<p style="color:var(--text-muted); font-size:0.8rem;">No activity yet.</p>';
    }

    const tmGrid = document.getElementById('trendingMaterialsGrid');
    if (tmGrid) {
        const trending = [...materials].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 3);
        if (trending.length > 0) {
            tmGrid.innerHTML = trending.map(m => generateMaterialCardHTML(m, subjects, '🔥 TRENDING', 'var(--primary)')).join('');
        } else {
            tmGrid.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No trending materials yet.</p>';
        }
    }

    const rmGrid = document.getElementById('recentMaterialsGrid');
    if (rmGrid) {
        const recent = [...materials].sort((a, b) => b.id - a.id).slice(0, 3);
        if (recent.length > 0) {
            rmGrid.innerHTML = recent.map(m => generateMaterialCardHTML(m, subjects, 'NEW UPLOAD', '#10b981')).join('');
        } else {
            rmGrid.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No recent materials yet.</p>';
        }
    }
}

async function renderStudentProfile(user) {
    const downloads = await DataService.getStudentActivity(user.username);
    const elName = document.getElementById('profileName');
    if (!elName) return;

    elName.textContent = user.username;
    document.getElementById('profileInitial').textContent = user.username[0].toUpperCase();
    document.getElementById('profileRole').textContent = `STUDENT • ${user.section || 'General'}`;
    document.getElementById('profileDownloads').textContent = downloads.length;

    const materials = await DataService.getMaterials();
    let prog = 0;
    if (materials.length > 0 && downloads.length > 0) {
        prog = Math.min(100, Math.floor((downloads.length / 5) * 100));
    }

    document.getElementById('progressText').textContent = prog + '%';
    const circle = document.getElementById('progressCircle');
    if (circle) circle.style.background = `conic-gradient(var(--primary) ${prog}%, rgba(255,255,255,0.05) ${prog}%)`;

    const activityList = document.getElementById('profileActivityList');
    if (activityList) {
        if (downloads.length === 0) {
            activityList.innerHTML = `<li style="text-align: center; padding: 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px;">No recent activity tracked. Download some materials!</li>`;
        } else {
            activityList.innerHTML = downloads.map(d => `
                <li style="display: flex; align-items: center; gap: 15px; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);">
                    <ion-icon name="cloud-download" style="color: #10b981; font-size: 1.5rem;"></ion-icon>
                    <div>
                        <div style="font-weight: 600; color: var(--text-main);">${d.title}</div>
                        <div style="font-size: 0.8rem;">Downloaded • ${new Date(d.time).toLocaleDateString()}</div>
                    </div>
                </li>
            `).join('');
        }
    }
}

window.trackDownload = async function (matId, title) {
    Toast.success(`Downloading ${title}...`);

    // Trigger actual browser download with a mock file
    const content = `Content for ${title}\nMock document generated by PrepSync.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    await DataService.trackDownload(matId, title);

    const user = AuthService.getCurrentUser();
    if (user && user.role === 'student') {
        renderStudentProfile(user);
    }
    renderDashboardStats();
};


// --- 5. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    Toast.init();
    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/')) {
        // Login Page Init
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            AuthService.loginCallback(
                document.getElementById('username').value,
                document.getElementById('password').value
            );
        });

        // Demo Buttons Logic
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const role = btn.dataset.role;
                document.getElementById('username').value = role;
                document.getElementById('password').value = 'password';

                // Trigger form submission
                const event = new Event('submit', {
                    'bubbles': true,
                    'cancelable': true
                });
                document.getElementById('loginForm').dispatchEvent(event);
            });
        });

        // Register Modal Logic
        const regModal = document.getElementById('registerModal');
        const forgotModal = document.getElementById('forgotModal');
        // Legacy Forgot Password Logic Removed
        // document.getElementById('forgotForm')...

        document.getElementById('showRegister')?.addEventListener('click', (e) => { e.preventDefault(); regModal.style.display = 'block'; });
        document.getElementById('closeRegister')?.addEventListener('click', () => regModal.style.display = 'none');

        // Toggle Section Field based on Role
        // REMOVED: Now we want faculty to select section too
        // document.getElementById('regRole')?.addEventListener('change', ...);

        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const success = AuthService.register(
                document.getElementById('regUsername').value,
                document.getElementById('regPassword').value,
                document.getElementById('regRole').value,
                document.getElementById('regEmail').value,
                document.getElementById('regSecurityQ').value,
                document.getElementById('regSecurityA').value,
                document.getElementById('regSection').value // Pass section
            );
            if (success) regModal.style.display = 'none';
        });

        // Forgot Password Logic - Multi Step
        let recoveryUsername = '';
        let currentGeneratedOtp = null;

        document.getElementById('showForgot')?.addEventListener('click', (e) => { e.preventDefault(); forgotModal.style.display = 'block'; });
        window.closeForgotModal = () => forgotModal.style.display = 'none';

        // Step 1 Submit
        document.getElementById('forgotFormStep1')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('forgotUsername').value;
            const result = AuthService.verifyUser(u);

            if (result.found) {
                recoveryUsername = u;
                document.getElementById('displaySecurityQ').textContent = result.question;

                document.getElementById('forgotStep1').style.display = 'none';
                document.getElementById('forgotStep2').style.display = 'block';
            } else {
                Toast.error('User not found');
            }
        });

        // Tab Logic
        const tabQ = document.getElementById('tabQuestion');
        const tabO = document.getElementById('tabOtp');
        const viewQ = document.getElementById('secMethodQuestion');
        const viewO = document.getElementById('secMethodOtp');

        tabQ?.addEventListener('click', () => {
            tabQ.className = 'btn btn-primary';
            tabO.className = 'btn btn-ghost';
            viewQ.style.display = 'block';
            viewO.style.display = 'none';
        });

        tabO?.addEventListener('click', () => {
            tabO.className = 'btn btn-primary';
            tabQ.className = 'btn btn-ghost';
            viewO.style.display = 'block';
            viewQ.style.display = 'none';
        });

        // OTP Handler
        document.getElementById('sendOtpBtn')?.addEventListener('click', () => {
            // Simulation
            currentGeneratedOtp = Math.floor(1000 + Math.random() * 9000).toString();
            Toast.info(`[SIMULATION] Email sent to registered user. OTP: ${currentGeneratedOtp}`);
            const otpIn = document.getElementById('otpInput');
            otpIn.disabled = false;
            otpIn.focus();
        });

        // Step 2 Submit (Verify)
        document.getElementById('forgotFormStep2')?.addEventListener('submit', (e) => {
            e.preventDefault();

            const isOtpMode = viewO.style.display === 'block';
            let isValid = false;

            if (isOtpMode) {
                const otp = document.getElementById('otpInput').value;
                if (!otp) { Toast.error('Please enter the OTP'); return; }
                isValid = AuthService.verifySecurity(recoveryUsername, null, otp, currentGeneratedOtp);
            } else {
                const ans = document.getElementById('securityAnswerInput').value;
                if (!ans) { Toast.error('Please enter your answer'); return; }
                isValid = AuthService.verifySecurity(recoveryUsername, ans, null, null);
            }

            if (isValid) {
                Toast.success('Identity Verified');
                document.getElementById('forgotStep2').style.display = 'none';
                document.getElementById('forgotStep3').style.display = 'block';
            } else {
                Toast.error('Incorrect Security Answer or OTP');
            }
        });

        // Step 3 Submit (Reset)
        document.getElementById('forgotFormStep3')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const success = AuthService.resetPassword(
                recoveryUsername,
                document.getElementById('resetNewPassword').value
            );
            if (success) {
                forgotModal.style.display = 'none';
                // Reset steps for next time
                setTimeout(() => {
                    document.getElementById('forgotStep1').style.display = 'block';
                    document.getElementById('forgotStep2').style.display = 'none';
                    document.getElementById('forgotStep3').style.display = 'none';
                    document.getElementById('forgotFormStep1').reset();
                    document.getElementById('forgotFormStep2').reset();
                    document.getElementById('forgotFormStep3').reset();
                }, 500);
            }
        });

    } else if (path.includes('dashboard.html')) {
        // Dashboard Init
        const user = AuthService.getCurrentUser();
        if (!user) { window.location.href = 'index.html'; return; }

        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) welcomeName.textContent = user.username;

        // document.getElementById('userName') was removed in the new layout

        const userInitial = document.getElementById('userInitial');
        if (userInitial) userInitial.textContent = user.username[0].toUpperCase();

        const userRole = document.getElementById('userRole');
        if (userRole) userRole.textContent = user.role.toUpperCase();

        document.getElementById('logoutBtn').addEventListener('click', AuthService.logout);

        // Feature: Hero Search Filtering
        document.getElementById('searchSubject')?.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val.length > 0) {
                // Force switch to subjects tab if searching
                if (!document.getElementById('view-subjects').classList.contains('active')) {
                    window.switchTab('subjects');
                }
            }
            renderSubjects(user);
        });

        renderSubjects(user);

        // Role based visibility
        if (user.role === 'admin' || user.role === 'faculty') {
            document.getElementById('addSubjectBtn')?.classList.remove('hidden');
            document.getElementById('adminTab')?.classList.remove('hidden');
        }

        if (user.role === 'student') {
            document.getElementById('profileTab')?.classList.remove('hidden');
            renderStudentProfile(user);
        }

        if (user.role === 'admin' || user.role === 'faculty') {
            renderAdminStats();
        }

        renderDashboardStats();

        // Feature: Add Subject Modal
        const subModal = document.getElementById('addSubjectModal');
        document.getElementById('addSubjectBtn')?.addEventListener('click', () => subModal.style.display = 'flex');
        document.getElementById('closeAddSubject')?.addEventListener('click', () => subModal.style.display = 'none');
        document.getElementById('addSubjectForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await DataService.addSubject(
                document.getElementById('subName').value,
                document.getElementById('subCode').value,
                document.getElementById('subSections').value
            );
            subModal.style.display = 'none';
            renderSubjects(user);
        });

        // Feature: Upload Modal Global Helpers
        const upModal = document.getElementById('uploadMaterialModal');
        window.openUploadModal = async (subId) => {
            const subjects = await DataService.getSubjects();
            const sub = subjects.find(s => s.id === subId);
            document.getElementById('uploadSubName').value = sub.name;
            document.getElementById('uploadSubId').value = sub.id;
            upModal.style.display = 'block';
        };
        document.getElementById('closeUpload')?.addEventListener('click', () => upModal.style.display = 'none');
        document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await DataService.addMaterial(
                Number(document.getElementById('uploadSubId').value),
                document.getElementById('matTitle').value,
                document.getElementById('matUnit').value,
                document.getElementById('matType').value,
                document.getElementById('matCategory').value
            );
            upModal.style.display = 'none';
            // Refresh details view to show new upload
            const currentSubId = Number(document.getElementById('uploadSubId').value);
            window.openSubject(currentSubId);
        });

        window.deleteUser = async (e, username) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to remove user: ${username}?`)) {
                await DataService.removeUser(username);
                renderAdminStats();
                renderDashboardStats();
            }
        };

        window.deleteSubject = async (e, id) => {
            e.stopPropagation();
            await DataService.removeSubject(id);
            renderSubjects(user);
        };

        // Feature: Subject Details View
        window.openSubject = async (id) => {
            const subjects = await DataService.getSubjects();
            const sub = subjects.find(s => s.id === id);
            if (!sub) return;

            // 1. Switch View
            document.querySelectorAll('.content-view').forEach(v => v.classList.add('hidden'));
            document.getElementById('view-subject-details').classList.remove('hidden');

            // 2. Populate Header
            document.getElementById('detSubName').textContent = sub.name;
            document.getElementById('detSubCode').textContent = sub.code;
            document.getElementById('detSubIcon').innerHTML = `<ion-icon name="book"></ion-icon>`;

            // 3. Populate Materials into Categories
            const mats = await DataService.getMaterials();
            const subMats = mats.filter(m => m.subjectId === id);

            const catNotes = document.getElementById('category-Notes');
            const catAssign = document.getElementById('category-Assignments');
            const catExams = document.getElementById('category-Exams');
            const listNotes = document.getElementById('list-Notes');
            const listAssign = document.getElementById('list-Assignments');
            const listExams = document.getElementById('list-Exams');
            const noMats = document.getElementById('noMaterialsMessage');

            // Reset
            listNotes.innerHTML = ''; listAssign.innerHTML = ''; listExams.innerHTML = '';
            catNotes.style.display = 'none'; catAssign.style.display = 'none'; catExams.style.display = 'none';
            noMats.style.display = 'none';

            if (subMats.length === 0) {
                noMats.style.display = 'block';
            } else {
                subMats.forEach(m => {
                    const html = `
                        <div class="glass-panel" style="padding: 15px; display: flex; align-items: center; justify-content: space-between; transition: transform 0.2s; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="font-size: 1.5rem; color: ${m.type === 'PDF' ? '#ef4444' : m.type === 'PPT' ? '#f59e0b' : '#3b82f6'};">
                                    <ion-icon name="${m.type === 'Video' ? 'play-circle' : m.type === 'PPT' ? 'easel' : 'document-text'}"></ion-icon>
                                </div>
                                <div>
                                    <h4 style="font-size: 1rem; margin-bottom: 2px;">${m.title}</h4>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 10px;">
                                        <span>Unit ${m.unit}</span>
                                        <span>•</span>
                                        <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-muted); padding: 1px 6px;">${m.category || m.type}</span>
                                        <span>•</span>
                                        <span><ion-icon name="download-outline"></ion-icon> ${m.downloads || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-ghost" style="padding: 8px;" onclick="trackDownload(${m.id}, '${m.title}')"><ion-icon name="download-outline"></ion-icon></button>
                        </div>
                    `;

                    // Categorize logic
                    const c = (m.category || '').toLowerCase();
                    if (c.includes('note')) {
                        listNotes.innerHTML += html;
                        catNotes.style.display = 'block';
                    } else if (c.includes('assignment') || c.includes('practical')) {
                        listAssign.innerHTML += html;
                        catAssign.style.display = 'block';
                    } else if (c.includes('exam') || c.includes('paper')) {
                        listExams.innerHTML += html;
                        catExams.style.display = 'block';
                    } else {
                        // Default fallback mapping to Notes
                        listNotes.innerHTML += html;
                        catNotes.style.display = 'block';
                    }
                });
            }

            // 4. Wire Upload Button in Details
            if (user.role === 'admin' || user.role === 'faculty') {
                document.getElementById('detUploadBtn').classList.remove('hidden');
                document.getElementById('detUploadBtn').onclick = () => window.openUploadModal(id);
            } else {
                document.getElementById('detUploadBtn').classList.add('hidden');
            }
        };

        // Search Button Focus
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            document.getElementById('searchSubject')?.focus();
        });
    }
});
