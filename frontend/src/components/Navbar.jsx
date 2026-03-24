import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { notificationService } from '../services';
import { 
  LayoutDashboard, 
  DollarSign, 
  GraduationCap, 
  Calendar, 
  ClipboardList,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    loadUnreadCount();
    // new notif every 30 secs
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getNotifications(1, true);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/fees', label: 'Fees', icon: DollarSign },
    { path: '/grades', label: 'Grades', icon: GraduationCap },
    { path: '/attendance', label: 'Attendance', icon: ClipboardList },
    { path: '/timetable', label: 'Timetable', icon: Calendar },
  ];

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.container}>
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>🎓</div>
            <h2 style={styles.logo}>School Portal</h2>
          </div>
          
          <button 
            style={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div style={{
            ...styles.links,
            ...(mobileMenuOpen && styles.linksMobile)
          }}
          className={mobileMenuOpen ? 'nav-links-mobile' : 'nav-links'}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ 
                    ...styles.link, 
                    ...(isActive(link.path) && styles.activeLink) 
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div style={styles.userSection} className="user-section">
            <button 
              onClick={() => navigate('/grades')}
              style={{ 
                ...styles.notificationBtn,
                position: 'relative'
              }}
              title="View recent grades"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount}</span>
              )}
            </button>
            <div style={styles.userInfo} className="user-info">
              <div style={styles.userAvatar}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div style={styles.userDetails} className="user-details">
                <span style={styles.userName}>{user?.firstName} {user?.lastName}</span>
                <span style={styles.userRole}>
                  {user?.role === 'parent' ? 'Parent' : 'Student'}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>
      <style jsx="true">{`
        @media (max-width: 992px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .nav-links {
            display: none !important;
          }
          
          .nav-links-mobile {
            display: flex !important;
          }
          
          .user-details {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .user-info {
            gap: 8px !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  nav: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    padding: '0',
    marginBottom: '0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    position: 'relative',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logo: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    whiteSpace: 'nowrap',
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#1f2937',
    padding: '8px',
  },
  links: {
    display: 'flex',
    gap: '6px',
    flex: 1,
    justifyContent: 'center',
  },
  linksMobile: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    gap: '4px',
    zIndex: 999,
  },
  link: {
    color: '#6b7280',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
  },
  activeLink: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
  },
  userRole: {
    fontSize: '11px',
    color: '#6b7280',
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '9px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)',
  },
  notificationBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '9px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.25)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    minWidth: '18px',
    textAlign: 'center',
  },
};

export default Navbar;
