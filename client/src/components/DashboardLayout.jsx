import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function DashboardLayout({ user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleNav = (path) => {
        navigate(path);
    };

    const currentTab = location.pathname.split('/')[1] || 'dashboard';

    return (
        <>
            <nav className="navbar">
                <div className="brand">
                    <ion-icon name="shapes"></ion-icon>
                    <span>PrepSync</span>
                </div>

                <ul className="nav-menu">
                    <li><a className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleNav('/dashboard')}>Dashboard</a></li>
                    <li><a className={`nav-link ${currentTab === 'subjects' ? 'active' : ''}`} onClick={() => handleNav('/subjects')}>Resources</a></li>
                    <li><a className={`nav-link ${currentTab === 'about' ? 'active' : ''}`} onClick={() => handleNav('/about')}>About</a></li>
                    {user?.role === 'student' && (
                        <li><a className={`nav-link ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => handleNav('/profile')}>My Profile</a></li>
                    )}
                    {(user?.role === 'admin' || user?.role === 'faculty') && (
                        <li><a className={`nav-link ${currentTab === 'admin' ? 'active' : ''}`} onClick={() => handleNav('/admin')}>Admin</a></li>
                    )}
                </ul>

                <div className="auth-buttons">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '15px' }}>
                        <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                            <span id="welcomeName" style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem' }}>{user?.username}</span>
                            <span id="userRole" style={{ fontSize: '0.75rem', opacity: 0.8 }}>{user?.role?.toUpperCase()}</span>
                        </div>
                        <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                    </div>
                    <button onClick={onLogout} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Sign out</button>
                </div>
            </nav>

            {/* Hero Section - Only show on Dashboard or Subjects list */}
            {(currentTab === 'dashboard' || currentTab === 'subjects') && !location.pathname.includes('/subjects/') && (
                <div className="hero-section" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div className="blob blob-pale-blue" style={{ top: '-100px', left: '-150px', transform: 'scale(0.6)' }}></div>
                    <div className="blob blob-orange" style={{ right: '-50px', top: '20px', transform: 'scale(0.7)' }}></div>
                    <div className="blob blob-lime-lg" style={{ bottom: '-150px', right: '-50px', transform: 'scale(0.5)' }}></div>

                    <div className="hero-content animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '10px' }}>What are you studying today?</h1>
                        <p className="hero-subtitle" style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px' }}>Find the best study documents from your seniors and professors.</p>

                        <div className="hero-search" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.2)', maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '50px', padding: '5px 10px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <input
                                type="text"
                                placeholder="Search for courses, notes, or previous year papers (e.g. INT213)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && navigate(`/subjects?search=${searchQuery}`)}
                                style={{ flex: 1, background: 'transparent', border: 'none', padding: '15px 20px', color: 'white', fontSize: '1rem', outline: 'none' }}
                            />
                            <button onClick={() => navigate(`/subjects?search=${searchQuery}`)} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                <ion-icon name="search"></ion-icon>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Container */}
            <div className="dashboard-container">
                <Outlet />
            </div>
        </>
    );
}
