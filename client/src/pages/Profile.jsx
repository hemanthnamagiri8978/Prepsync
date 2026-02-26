import { useState, useEffect } from 'react';
import { DataService } from '../services/api';

export default function Profile({ user }) {
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState({ materials: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('downloads');

    useEffect(() => {
        Promise.all([
            DataService.getStudentActivity(user.username),
            DataService.getStats()
        ]).then(([acts, s]) => {
            setActivities(acts);
            setStats(s);
            setLoading(false);
        });
    }, [user.username]);

    const downloadsCount = activities.length;
    const progressPercent = stats.materials > 0
        ? Math.min(Math.round((downloadsCount / stats.materials) * 100), 100)
        : 0;

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className="dashboard-layout" style={{ gridTemplateColumns: 'minmax(300px, 400px) 1fr' }}>
            {/* Profile Card (Left) */}
            <div className="glass-panel" style={{ padding: '40px 30px', textAlign: 'center', height: 'fit-content' }}>
                <div style={{ width: '120px', height: '120px', background: 'var(--bg-hero)', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', fontWeight: 800, position: 'relative' }}>
                    {user.username.substring(0, 2).toUpperCase()}
                    <button style={{ position: 'absolute', bottom: 0, right: 0, width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Edit Avatar">
                        <ion-icon name="camera"></ion-icon>
                    </button>
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{user.username}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Student • {user.section}</p>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: '25px', border: '1px solid #e2e8f0' }}>Edit Profile</button>

                <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Preparation Progress</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{progressPercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'left' }}>
                        Downloaded {downloadsCount} of {stats.materials} available materials
                    </p>
                </div>
            </div>

            {/* Main Tabs (Right) */}
            <div>
                <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '30px', overflowX: 'auto' }}>
                    {[
                        { id: 'downloads', label: 'Recent Downloads', icon: 'cloud-download' },
                        { id: 'uploads', label: 'My Uploads', icon: 'cloud-upload' },
                        { id: 'saved', label: 'Saved Items', icon: 'bookmark' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 15px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ion-icon name={tab.icon}></ion-icon>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="glass-panel" style={{ padding: '30px' }}>
                    {activeTab === 'downloads' && (
                        activities.length > 0 ? activities.map(act => (
                            <div key={act.id} style={{ display: 'flex', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                                    <ion-icon name="cloud-download"></ion-icon>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-main)' }}>Downloaded a file</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{act.material_title || act.title}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(act.time).toLocaleString()}</p>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <ion-icon name="time-outline" style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '10px' }}></ion-icon>
                                <p>No downloads yet.</p>
                                <button className="btn btn-primary" style={{ marginTop: '15px' }}>Explore Resources</button>
                            </div>
                        )
                    )}
                    {activeTab === 'uploads' && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <ion-icon name="cloud-upload-outline" style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '10px' }}></ion-icon>
                            <p>You haven't uploaded any materials yet.</p>
                        </div>
                    )}
                    {activeTab === 'saved' && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <ion-icon name="bookmark-outline" style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '10px' }}></ion-icon>
                            <p>You have no saved items.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
