import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetails from './pages/SubjectDetails';
import About from './pages/About';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { AuthService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  if (loading) return null; // Or a spinner

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route path="/" element={user ? <DashboardLayout user={user} onLogout={() => { AuthService.logout(); setUser(null); }} /> : <Navigate to="/" />}>
          <Route path="dashboard" element={<Dashboard user={user} />} />
          <Route path="subjects" element={<Subjects user={user} />} />
          <Route path="subjects/:id" element={<SubjectDetails user={user} />} />
          <Route path="about" element={<About />} />
          {user?.role === 'student' && <Route path="profile" element={<Profile user={user} />} />}
          {(user?.role === 'admin' || user?.role === 'faculty') && <Route path="admin" element={<Admin user={user} />} />}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
