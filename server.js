const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Setup
const dbPath = path.resolve(__dirname, 'prepsync.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            section TEXT,
            email TEXT,
            securityQuestion TEXT,
            securityAnswer TEXT
        )`);

        // Subjects Table
        db.run(`CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            code TEXT,
            img TEXT,
            sections TEXT
        )`);

        // Materials Table
        db.run(`CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subjectId INTEGER,
            title TEXT,
            unit TEXT,
            type TEXT,
            category TEXT,
            fileUrl TEXT,
            downloads INTEGER DEFAULT 0
        )`);

        // Add fileUrl column if it does not exist (for backwards compatibility without dropping)
        db.run(`ALTER TABLE materials ADD COLUMN fileUrl TEXT`, (err) => { /* ignore if exists */ });

        // Student Downloads Tracking Table
        db.run(`CREATE TABLE IF NOT EXISTS downloads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            materialId INTEGER,
            title TEXT,
            time INTEGER
        )`);

        seedDatabase();
    });
}

function seedDatabase() {
    // Check if admin user exists, if not, add mock data
    db.get(`SELECT id FROM users WHERE username = 'admin'`, (err, row) => {
        if (!row) {
            console.log("Seeding mock data...");
            // Add Admin
            db.run(`INSERT INTO users (username, password, role, section) VALUES ('admin', 'password', 'admin', 'all')`);
            // Add Demo Student
            db.run(`INSERT INTO users (username, password, role, section) VALUES ('student', 'password', 'student', 'K23PG')`);
            // Add Demo Faculty
            db.run(`INSERT INTO users (username, password, role, section) VALUES ('faculty', 'password', 'faculty', 'K23PG,K23ND')`);

            // Add Default Subjects
            const subs = [
                ["Operating Systems", "INT214", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", "K23PG,K23ND"],
                ["Data Structures and Algorithms", "INT213", "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=600&q=80", "K23PG"],
                ["Computer Networks", "INT215", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", "K23ND"]
            ];
            subs.forEach(s => {
                db.run(`INSERT INTO subjects (name, code, img, sections) VALUES (?, ?, ?, ?)`, s, function (err) {
                    if (!err) {
                        const subId = this.lastID;
                        // Add mock materials for this subject
                        db.run(`INSERT INTO materials (subjectId, title, unit, type, category) VALUES (?, 'Syllabus & Introduction', 'Unit 1', 'PDF', 'Notes')`, subId);
                        db.run(`INSERT INTO materials (subjectId, title, unit, type, category) VALUES (?, 'Assignment 1', 'Unit 1', 'Word', 'Assignments')`, subId);
                    }
                });
            });
        }
    });
}

// --- API ENDPOINTS ---

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
    const { username, password, role, section, email, securityQuestion, securityAnswer } = req.body;
    const sql = `INSERT INTO users (username, password, role, section, email, securityQuestion, securityAnswer) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [username, password, role, section, email, securityQuestion, securityAnswer], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ success: true, id: this.lastID });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT id, username, role, section, email FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (row) {
            res.json({ success: true, user: row });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.post('/api/auth/verify', (req, res) => {
    const { username } = req.body;
    db.get(`SELECT email, securityQuestion FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (row) {
            res.json({ found: true, question: row.securityQuestion || 'No associated question (Legacy)', email: row.email });
        } else {
            res.json({ found: false });
        }
    });
});

app.post('/api/auth/verify-security', (req, res) => {
    const { username, answer } = req.body;
    db.get(`SELECT securityAnswer FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (row && row.securityAnswer && row.securityAnswer.toLowerCase() === answer.toLowerCase()) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

app.post('/api/auth/reset', (req, res) => {
    const { username, newPassword } = req.body;
    db.run(`UPDATE users SET password = ? WHERE username = ?`, [newPassword, username], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

// Subjects endpoints
app.get('/api/subjects', (req, res) => {
    db.all(`SELECT * FROM subjects`, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/subjects', (req, res) => {
    const { name, code, img, sections } = req.body;
    db.run(`INSERT INTO subjects (name, code, img, sections) VALUES (?, ?, ?, ?)`, [name, code, img, sections], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ id: this.lastID, name, code, img, sections });
    });
});

app.delete('/api/subjects/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM subjects WHERE id = ?`, id, function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        // Also delete associated materials
        db.run(`DELETE FROM materials WHERE subjectId = ?`, id);
        res.json({ success: true });
    });
});

// Materials endpoints
app.get('/api/materials', (req, res) => {
    db.all(`SELECT * FROM materials ORDER BY id DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/materials', upload.single('file'), (req, res) => {
    const { subjectId, title, unit, type, category } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(`INSERT INTO materials (subjectId, title, unit, type, category, fileUrl) VALUES (?, ?, ?, ?, ?, ?)`,
        [subjectId, title, unit, type, category, fileUrl], function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ success: true, id: this.lastID, fileUrl });
        });
});

app.post('/api/materials/:id/download', (req, res) => {
    const matId = req.params.id;
    const { username, title } = req.body; // Student tracking data

    db.run(`UPDATE materials SET downloads = downloads + 1 WHERE id = ?`, [matId], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (username) {
            db.run(`INSERT INTO downloads (username, materialId, title, time) VALUES (?, ?, ?, ?)`,
                [username, matId, title, Date.now()]);
        }
        res.json({ success: true });
    });
});

// Stats & Profile endpoints
app.get('/api/stats', (req, res) => {
    db.get(`SELECT COUNT(*) as users FROM users`, (err, uRow) => {
        db.get(`SELECT COUNT(*) as materials FROM materials`, (err, mRow) => {
            db.all(`SELECT id, username, email, role, section FROM users`, (err, allUsers) => {
                db.all(`SELECT username, COUNT(*) as count FROM downloads GROUP BY username ORDER BY count DESC LIMIT 5`, (err, topDLRows) => {
                    res.json({
                        users: uRow ? uRow.users : 0,
                        materials: mRow ? mRow.materials : 0,
                        userList: allUsers || [],
                        topDownloaders: topDLRows || []
                    });
                });
            });
        });
    });
});

app.get('/api/users/:username/downloads', (req, res) => {
    db.all(`SELECT * FROM downloads WHERE username = ? ORDER BY time DESC`, [req.params.username], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.delete('/api/users/:username', (req, res) => {
    const username = req.params.username;
    if (username === 'admin') return res.status(403).json({ error: 'Cannot delete admin' });
    db.run(`DELETE FROM users WHERE username = ?`, username, function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`PrepSync Server is running on http://localhost:${PORT}`);
});
