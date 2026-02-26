import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataService } from '../services/api';

export default function SubjectDetails({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [title, setTitle] = useState('');
    const [unit, setUnit] = useState('Unit 1');
    const [type, setType] = useState('pdf');
    const [category, setCategory] = useState('notes');
    const [file, setFile] = useState(null);
    const [activeTab, setActiveTab] = useState('notes');

    useEffect(() => {
        Promise.all([DataService.getSubjects(), DataService.getMaterials()])
            .then(([subs, mats]) => {
                const sub = subs.find(s => s.id === parseInt(id));
                if (sub) {
                    setSubject(sub);
                    setMaterials(mats.filter(m => m.subjectId === sub.id));
                }
                setLoading(false);
            });
    }, [id]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a file');
        await DataService.addMaterial(subject.id, title, unit, type, category, file);
        setShowUploadModal(false);
        setFile(null);
        setTitle('');
        // Refresh materials
        const mats = await DataService.getMaterials();
        setMaterials(mats.filter(m => m.subjectId === subject.id));
    };

    const handleDownload = async (mat) => {
        await DataService.trackDownload(mat.id, mat.title);
        if (mat.fileUrl) {
            window.open(`http://localhost:3000${mat.fileUrl}`, '_blank');
        } else {
            alert(`Downloading ${mat.title}... (Mock File)`);
        }
    };

    if (loading) return <div>Loading course...</div>;
    if (!subject) return <div>Course not found.</div>;

    const categories = ['notes', 'assignments', 'exams'];

    return (
        <>
            <div className="section-header">
                <div>
                    <button className="btn btn-ghost" onClick={() => navigate('/subjects')} style={{ marginBottom: '15px', color: 'var(--primary)' }}>
                        <ion-icon name="arrow-back-outline" style={{ marginRight: '5px' }}></ion-icon> Back to Courses
                    </button>
                    <h2 className="section-title">{subject.name} <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>({subject.code})</span></h2>
                </div>
                {(user.role === 'admin' || user.role === 'faculty') && (
                    <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                        <ion-icon name="cloud-upload"></ion-icon> Upload Material
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '30px', overflowX: 'auto' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === cat ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === cat ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === cat ? 700 : 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ion-icon name={cat === 'notes' ? 'book' : cat === 'assignments' ? 'clipboard' : 'document-text'}></ion-icon>
                        {cat}
                    </button>
                ))}
            </div>

            {categories.filter(c => c === activeTab).map(cat => {
                const catMats = materials.filter(m => m.category === cat);
                if (catMats.length === 0) return (
                    <div key="empty" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <ion-icon name="folder-open-outline" style={{ fontSize: '4rem', opacity: 0.5, marginBottom: '15px' }}></ion-icon>
                        <p style={{ fontSize: '1.1rem' }}>No {cat} uploaded for this course yet.</p>
                        {(user.role === 'admin' || user.role === 'faculty') && (
                            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => { setCategory(cat); setShowUploadModal(true); }}>Upload Now</button>
                        )}
                    </div>
                );

                return (
                    <div key={cat} style={{ marginBottom: '40px' }}>
                        <div className="card-grid">
                            {catMats.map(mat => (
                                <div key={mat.id} className="glass-panel hover-lift" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{ width: '45px', height: '45px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                            <ion-icon name="document"></ion-icon>
                                        </div>
                                        <span className="badge badge-blue">{mat.type?.toUpperCase() || 'FILE'}</span>
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-main)', lineHeight: '1.4' }}>{mat.title}</h4>
                                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ion-icon name="folder"></ion-icon> {mat.unit}</span>
                                        {mat.date_added && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ion-icon name="calendar"></ion-icon> {new Date(mat.date_added).toLocaleDateString()}</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary)', border: '1px solid rgba(34, 197, 94, 0.2)' }} onClick={() => handleDownload(mat)}>
                                            <ion-icon name="download-outline"></ion-icon> Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {showUploadModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
                        <h2 className="section-title" style={{ marginBottom: '20px' }}>Upload Material: {subject.code}</h2>
                        <form onSubmit={handleUpload}>
                            <input type="text" className="input-field" placeholder="Material Title (e.g. Chapter 4 Notes)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ marginBottom: '15px' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <select className="input-field" value={unit} onChange={(e) => setUnit(e.target.value)} required>
                                    <option value="Unit 1">Unit 1</option><option value="Unit 2">Unit 2</option><option value="Unit 3">Unit 3</option><option value="Unit 4">Unit 4</option>
                                </select>
                                <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                    <option value="notes">Notes</option><option value="assignments">Assignments</option><option value="exams">Past Exams</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <input type="file" className="input-field" onChange={(e) => setFile(e.target.files[0])} required style={{ border: '1px dashed #cbd5e1', padding: '15px', background: '#f8fafc', color: 'var(--text-muted)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowUploadModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Upload File</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
