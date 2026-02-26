import { useState, useEffect } from 'react';
import { DataService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user }) {
    const [stats, setStats] = useState({ users: 0, materials: 0, topDownloaders: [] });
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();

    // Upload Modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [upTitle, setUpTitle] = useState('');
    const [upSubject, setUpSubject] = useState('');
    const [upUnit, setUpUnit] = useState('Unit 1');
    const [upType, setUpType] = useState('pdf');
    const [upCategory, setUpCategory] = useState('notes');
    const [upFile, setUpFile] = useState(null);

    useEffect(() => {
        DataService.getStats().then(setStats);
        DataService.getMaterials().then(setMaterials);
        DataService.getSubjects().then(sets => {
            setSubjects(sets);
            if (sets.length > 0) setUpSubject(sets[0].id);
        });
    }, []);

    const trendingMats = [...materials].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 2);

    const handleGlobalUpload = async (e) => {
        e.preventDefault();
        if (!upFile) return alert('Please select a file');
        if (!upSubject) return alert('No subject selected');
        try {
            await DataService.addMaterial(upSubject, upTitle, upUnit, upType, upCategory, upFile);
            setShowUploadModal(false);
            setUpFile(null);
            setUpTitle('');
            // Refresh counts
            DataService.getStats().then(setStats);
            DataService.getMaterials().then(setMaterials);
            alert('Material uploaded successfully!');
        } catch (err) {
            alert('Failed to upload material');
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Main Content (Left) */}
            <div className="main-content">
                <div className="section-header">
                    <h2 className="section-title">Overview</h2>
                </div>

                <div className="card-grid" style={{ marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Active Courses</h4>
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>8</div>
                        </div>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            <ion-icon name="library"></ion-icon>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Materials</h4>
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.materials || 0}</div>
                        </div>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            <ion-icon name="document-text"></ion-icon>
                        </div>
                    </div>
                </div>

                <div className="section-header">
                    <h2 className="section-title">Trending Materials 🔥</h2>
                </div>
                <div className="card-grid" id="trendingMaterialsGrid">
                    {trendingMats.length > 0 ? trendingMats.map(mat => (
                        <div key={mat.id} className="glass-panel hover-lift" style={{ padding: '20px', borderLeft: '4px solid var(--accent)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div style={{ width: '45px', height: '45px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                    <ion-icon name="flame"></ion-icon>
                                </div>
                                <span className="badge badge-blue">{mat.downloads} Downloads</span>
                            </div>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-main)', lineHeight: '1.4' }}>{mat.title}</h4>
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '15px' }} onClick={() => navigate(`/subjects/${mat.subjectId}`)}>View Material</button>
                        </div>
                    )) : <p style={{ color: 'var(--text-muted)' }}>No trending materials yet.</p>}
                </div>
            </div>

            {/* Sidebar (Right) */}
            <aside className="sidebar">
                <div className="widget" style={{ background: 'var(--bg-hero)', color: 'white', border: 'none' }}>
                    <h3 className="widget-title" style={{ color: 'white' }}>
                        <ion-icon name="flash"></ion-icon> Quick Actions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(user.role === 'admin' || user.role === 'faculty') && (
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowUploadModal(true)}>
                                <ion-icon name="cloud-upload"></ion-icon> Upload Material
                            </button>
                        )}
                        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => navigate('/subjects')}>
                            Browse All
                        </button>
                    </div>
                </div>

                <div className="widget">
                    <h3 className="widget-title">
                        <ion-icon name="trophy"></ion-icon> Top Contributors
                    </h3>
                    <div id="topContributors" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {stats.topDownloaders?.length > 0 ? stats.topDownloaders.map((u, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', background: '#c084fc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                                        {u.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{u.username}</span>
                                </div>
                                <span className="badge badge-blue">{u.count} Downloads</span>
                            </div>
                        )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No activity yet.</p>}
                    </div>
                </div>
            </aside>

            {/* Global Upload Modal */}
            {showUploadModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
                        <h2 className="section-title" style={{ marginBottom: '20px' }}>Upload Material</h2>
                        <form onSubmit={handleGlobalUpload}>
                            <input type="text" className="input-field" placeholder="Material Title (e.g. Chapter 4 Notes)" value={upTitle} onChange={(e) => setUpTitle(e.target.value)} required style={{ marginBottom: '15px' }} />

                            <select className="input-field" value={upSubject} onChange={(e) => setUpSubject(e.target.value)} required style={{ marginBottom: '15px' }}>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                            </select>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <select className="input-field" value={upUnit} onChange={(e) => setUpUnit(e.target.value)} required>
                                    <option value="Unit 1">Unit 1</option><option value="Unit 2">Unit 2</option><option value="Unit 3">Unit 3</option><option value="Unit 4">Unit 4</option>
                                </select>
                                <select className="input-field" value={upCategory} onChange={(e) => setUpCategory(e.target.value)} required>
                                    <option value="notes">Notes</option><option value="assignments">Assignments</option><option value="exams">Past Exams</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <input type="file" className="input-field" onChange={(e) => setUpFile(e.target.files[0])} required style={{ border: '1px dashed #cbd5e1', padding: '15px', background: '#f8fafc', color: 'var(--text-muted)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowUploadModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Upload File</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
