import { useState } from 'react';
import { AuthService } from '../services/api';

export default function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Register State
    const [regRole, setRegRole] = useState('student');
    const [regSection, setRegSection] = useState('K23PG');
    const [regEmail, setRegEmail] = useState('');
    const [regSecQ, setRegSecQ] = useState('pet');
    const [regSecA, setRegSecA] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const user = await AuthService.login(username, password);
            onLogin(user);
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await AuthService.register(username, password, regRole, regEmail, regSecQ, regSecA, regSection);
            alert('Account created! Please login.');
            setIsLogin(true);
        } catch (err) {
            setError('Failed to register (username may be taken).');
        }
    };

    const demoLogin = async (role) => {
        try {
            const user = await AuthService.login(role, 'password');
            onLogin(user);
        } catch (err) {
            setError('Demo login failed');
        }
    };

    return (
        <div className="login-body">
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div className="blob blob-pale-blue"></div>
                <div className="blob blob-purple-sm"></div>
                <div className="blob blob-orange"></div>
                <div className="blob blob-lime-lg"></div>
                <div className="blob blob-green-sm"></div>
                <div className="blob blob-purple-btm"></div>
            </div>

            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '5px' }}>
                        <ion-icon name="shapes" style={{ fontSize: '2rem', color: 'var(--primary)', verticalAlign: 'middle', marginRight: '5px' }}></ion-icon>
                        PrepSync
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>{isLogin ? 'Your digital campus awaits.' : 'Join the community.'}</p>
                </div>

                {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

                {isLogin ? (
                    <>
                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.9)' }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="text" className="input-field" value={username} onChange={e => setUsername(e.target.value)} required />
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.9)' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>Sign In</button>
                        </form>

                        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ fontSize: '0.85rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '15px' }}>Quick Demo Access:</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => demoLogin('student')} className="btn btn-ghost demo-btn" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>Student</button>
                                <button type="button" onClick={() => demoLogin('faculty')} className="btn btn-ghost demo-btn" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>Faculty</button>
                            </div>
                            <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }} style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Account</a>
                            </div>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleRegister}>
                        <input type="text" className="input-glass" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ marginBottom: '15px' }} />
                        <input type="password" className="input-glass" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ marginBottom: '15px' }} />
                        <select className="input-glass" value={regRole} onChange={e => setRegRole(e.target.value)} style={{ marginBottom: '15px', background: 'var(--bg-hero)' }}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                        </select>
                        <select className="input-glass" value={regSection} onChange={e => setRegSection(e.target.value)} style={{ marginBottom: '15px', background: 'var(--bg-hero)' }}>
                            <option value="K23PG">K23PG</option>
                            <option value="K23ND">K23ND</option>
                            <option value="K23GF">K23GF</option>
                        </select>
                        <input type="email" className="input-glass" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required style={{ marginBottom: '15px' }} />
                        <input type="text" className="input-glass" placeholder="Security Answer (Pet Name)" value={regSecA} onChange={e => setRegSecA(e.target.value)} required style={{ marginBottom: '20px' }} />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setIsLogin(true)} className="btn btn-ghost" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
