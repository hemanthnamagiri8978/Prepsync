export default function About() {
    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">About PrepSync</h2>
            </div>

            <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <ion-icon name="shapes" style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '20px' }}></ion-icon>
                <h3 style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--text-main)' }}>Your Academic Companion</h3>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '30px' }}>
                    PrepSync is a student-centric platform designed to centralize academic resources.
                    By connecting students with high-quality notes, past exam papers, and crucial assignments,
                    we aim to streamline the study process and foster a collaborative learning environment.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'left', marginTop: '40px' }}>
                    <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1.1rem' }}><ion-icon name="library"></ion-icon> Organized Content</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Materials are neatly categorized by course, unit, and type for instant access.</p>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1.1rem' }}><ion-icon name="flash"></ion-icon> Fast Discovery</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Powerful search and filtering tools help you find exactly what you need.</p>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1.1rem' }}><ion-icon name="people"></ion-icon> Community Driven</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Contribute back by uploading your best notes and helping your peers excel.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
