import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <h2 style={styles.logo}>School Portal</h2>
        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') && styles.activeLink) }}>
            Dashboard
          </Link>
          <Link to="/fees" style={{ ...styles.link, ...(isActive('/fees') && styles.activeLink) }}>
            Fees
          </Link>
          <Link to="/grades" style={{ ...styles.link, ...(isActive('/grades') && styles.activeLink) }}>
            Grades
          </Link>
          <Link to="/attendance" style={{ ...styles.link, ...(isActive('/attendance') && styles.activeLink) }}>
            Attendance
          </Link>
          <Link to="/timetable" style={{ ...styles.link, ...(isActive('/timetable') && styles.activeLink) }}>
            Timetable
          </Link>
        </div>
        <div style={styles.userSection}>
          <span style={styles.username}>{user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#1f2937',
    color: 'white',
    padding: '1rem 0',
    marginBottom: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    margin: 0,
  },
  links: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: '#d1d5db',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'all 0.3s',
  },
  activeLink: {
    background: '#374151',
    color: 'white',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  username: {
    fontSize: '14px',
  },
};

export default Navbar;
