import { useState, useEffect, useMemo } from 'react';
import { DataService } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Subjects({ user }) {
    const [subjects, setSubjects] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Add Course Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSubName, setNewSubName] = useState('');
    const [newSubCode, setNewSubCode] = useState('');
    const [newSubSections, setNewSubSections] = useState('K23PG');

    useEffect(() => {
        Promise.all([DataService.getSubjects(), DataService.getMaterials()])
            .then(([subs, mats]) => {
                setSubjects(subs);
                setMaterials(mats);
                setLoading(false);
            });
    }, []);

    const visibleSubjects = useMemo(() => {
        const query = new URLSearchParams(location.search).get('search')?.toLowerCase() || '';
        return subjects.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query);
            if (!matchesSearch) return false;

            if (user.role === 'admin') return true;
            const sSections = (s.sections || '').split(',').map(x => x.trim());
            const userSections = (user.section || '').split(',').map(x => x.trim());
            return sSections.some(sec => userSections.includes(sec));
        });
    }, [subjects, user, location.search]);

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await DataService.addSubject(newSubName, newSubCode, newSubSections);
            setShowAddModal(false);
            setNewSubName('');
            setNewSubCode('');
            // refresh
            const subs = await DataService.getSubjects();
            setSubjects(subs);
        } catch (err) {
            alert('Failed to add subject');
        }
    };

    if (loading) return <div>Loading courses...</div>;

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">My Courses</h2>
                {(user.role === 'admin' || user.role === 'faculty') && (
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <ion-icon name="add"></ion-icon> Add Course
                    </button>
                )}
            </div>

            <div className="card-grid">
                {visibleSubjects.map(sub => (
                    <div key={sub.id} className="subject-card glass-panel">
                        <div className="subject-cover" style={{ backgroundImage: `url('${sub.img}')` }}>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                {sub.code}
                            </div>
                        </div>
                        <div className="subject-info">
                            <h4>{sub.name}</h4>
                            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ion-icon name="document-text"></ion-icon> {materials.filter(m => m.subjectId === sub.id).length} Files
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ion-icon name="people"></ion-icon> Sections: {sub.sections}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate(`/subjects/${sub.id}`)}>Open</button>
                                {(user.role === 'admin' || user.role === 'faculty') && (
                                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', border: '1px solid #e2e8f0' }} onClick={() => navigate(`/subjects/${sub.id}`)}>Upload</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {visibleSubjects.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No courses found for your section.
                    </div>
                )}
            </div>

            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
                        <h2 className="section-title" style={{ marginBottom: '20px' }}>Add New Course</h2>
                        <form onSubmit={handleAddSubject}>
                            <input type="text" className="input-field" placeholder="Course Name (e.g. Operating Systems)" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} required style={{ marginBottom: '15px' }} />
                            <input type="text" className="input-field" placeholder="Course Code (e.g. INT214)" value={newSubCode} onChange={(e) => setNewSubCode(e.target.value)} required style={{ marginBottom: '15px' }} />
                            <select className="input-field" value={newSubSections} onChange={(e) => setNewSubSections(e.target.value)} required style={{ marginBottom: '20px' }}>
                                <option value="K23PG">K23PG</option>
                                <option value="K23ND">K23ND</option>
                                <option value="K23GF">K23GF</option>
                                <option value="K23KL">K23KL</option>
                                <option value="K23TH">K23TH</option>
                                <option value="K23PG,K23ND,K23GF,K23KL,K23TH">All Sections</option>
                            </select>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
