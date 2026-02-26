import { useState, useEffect } from 'react';
import { DataService } from '../services/api';

export default function Admin({ user }) {
    const [stats, setStats] = useState({ users: 0, materials: 0, userList: [] });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        const data = await DataService.getStats();
        setStats(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleDeleteUser = async (username) => {
        if (confirm(`Are you sure you want to remove user: ${username}?`)) {
            await DataService.removeUser(username);
            fetchStats();
        }
    };

    if (loading) return <div>Loading admin data...</div>;

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">Admin Command Center</h2>
            </div>

            <div className="card-grid" style={{ marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Users</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.users}</div>
                    </div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(192, 132, 252, 0.1)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <ion-icon name="people"></ion-icon>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Materials</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.materials}</div>
                    </div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <ion-icon name="document-text"></ion-icon>
                    </div>
                </div>
            </div>

            <div className="section-header">
                <h2 className="section-title">System Users</h2>
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>User</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Role</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Section</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.userList.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 700 }}>
                                            {u.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span className={`badge ${u.role === 'admin' ? 'badge-blue' : u.role === 'faculty' ? 'badge-blue' : ''}`} style={{ background: u.role === 'student' ? 'rgba(34, 197, 94, 0.1)' : undefined, color: u.role === 'student' ? 'var(--primary)' : undefined }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {u.section || 'N/A'}
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                    {u.role !== 'admin' ? (
                                        <button
                                            onClick={() => handleDeleteUser(u.username)}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <ion-icon name="ban-outline"></ion-icon>
                                        </button>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Protected</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {stats.userList.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
