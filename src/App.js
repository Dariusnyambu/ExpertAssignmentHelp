import React, { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Floaters from './components/Floaters';
import ArkBot from './components/ArkBot';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import QuotePage from './pages/QuotePage';
import TrackingPage from './pages/TrackingPage';
import ReviewsPage from './pages/ReviewsPage';
import SamplesPage from './pages/SamplesPage';
import SubjectsPage from './pages/SubjectsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { supabase, getCurrentProfile, signOut } from './supabase';

function getInitialPage() {
  const path = window.location.pathname;
  if (path === '/admin' || path === '/admin/') return 'admin-login';
  return 'home';
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [user, setUser] = useState(null);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (p === 'admin' || p === 'admin-login') {
      window.history.pushState({}, '', '/admin');
    } else if (p === 'home') {
      window.history.pushState({}, '', '/');
    }
  };

  // ── Restore session on page load + listen for auth changes ──
  useEffect(() => {
    let active = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && active) {
        const profile = await getCurrentProfile();
        const merged = {
          id: session.user.id,
          email: session.user.email,
          full_name: profile?.full_name || session.user.email.split('@')[0],
          role: profile?.role || 'student',
        };
        setUser(merged);
        if (merged.role === 'admin' || merged.role === 'superadmin') {
          setAdminAuthed(true);
        }
      }
      if (active) setAuthChecked(true);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setAdminAuthed(false);
      }
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Listen for browser back/forward on /admin
  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/admin/') {
        setPage(adminAuthed ? 'admin' : 'admin-login');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [adminAuthed]);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'admin' || userData.role === 'superadmin') {
      setAdminAuthed(true);
      navigate('admin');
    } else {
      navigate('student');
    }
  };

  const handleAdminLogin = (adminData) => {
    setAdminAuthed(true);
    setUser(adminData);
    setPage('admin');
    window.history.pushState({}, '', '/admin');
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    navigate('home');
  };

  const handleAdminLogout = async () => {
    await signOut();
    setAdminAuthed(false);
    setUser(null);
    setPage('admin-login');
    window.history.pushState({}, '', '/admin');
  };

  const isAdmin = page === 'admin';
  const isAdminLogin = page === 'admin-login';
  const isLogin = page === 'login';
  const hideShell = isAdmin || isAdminLogin || isLogin;

  if (!authChecked) {
    return (
      <div style={{minHeight:'100vh',background:'#0A1931',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:36,height:36,border:'3px solid rgba(255,255,255,0.15)',borderTopColor:'#FF7A00',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const pages = {
    home:        <HomePage navigate={navigate}/>,
    services:    <ServicesPage navigate={navigate}/>,
    samples:     <SamplesPage navigate={navigate}/>,
    subjects:    <SubjectsPage navigate={navigate}/>,
    quote:       <QuotePage/>,
    tracking:    <TrackingPage navigate={navigate}/>,
    reviews:     <ReviewsPage navigate={navigate}/>,
    contact:     <ContactPage navigate={navigate}/>,
    login:       <LoginPage navigate={navigate} onLogin={handleLogin}/>,
    student:     <StudentDashboard navigate={navigate} user={user} onLogout={handleLogout}/>,
    'admin-login': <AdminLogin onLogin={handleAdminLogin} navigate={navigate}/>,
    admin:       adminAuthed
                   ? <AdminDashboard navigate={navigate} user={user} onLogout={handleAdminLogout}/>
                   : <AdminLogin onLogin={handleAdminLogin} navigate={navigate}/>,
  };

  return (
    <div>
      {!hideShell && <Navbar current={page} navigate={navigate} user={user} onLogout={handleLogout}/>}
      {pages[page] || pages['home']}
      {!hideShell && <Floaters navigate={navigate}/>}
      {!hideShell && <ArkBot navigate={navigate}/>}
    </div>
  );
}
