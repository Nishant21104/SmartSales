import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/chat', label: 'AI Chat', icon: '🤖' },
    { path: '/upload', label: 'Upload', icon: '📤' },
  ];

  const isActive = (path) => location.pathname === path;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      display: 'flex',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { box-sizing: border-box; }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: ${collapsed ? '10px' : '10px 14px'};
          border-radius: 10px;
          text-decoration: none;
          color: #5F5E5A;
          font-size: 13.5px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          position: relative;
        }
        .nav-link:hover {
          background: #F5F3EE;
          color: #1C1B19;
        }
        .nav-link.active {
          background: #EBF3FB;
          color: #2472B3;
          font-weight: 600;
        }
        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #378ADD;
          border-radius: 0 3px 3px 0;
        }
        .nav-icon {
          font-size: 16px;
          flex-shrink: 0;
          line-height: 1;
        }
        .collapse-btn {
          background: none;
          border: 1px solid #EEECEA;
          border-radius: 8px;
          cursor: pointer;
          padding: 6px 8px;
          color: #888780;
          font-size: 14px;
          transition: background 0.15s, color 0.15s;
          line-height: 1;
        }
        .collapse-btn:hover {
          background: #F5F3EE;
          color: #1C1B19;
        }
        .logout-btn {
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #C0392B;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.15s;
          font-family: inherit;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
        }
        .logout-btn:hover {
          background: #FDF1EE;
        }
        .tooltip {
          display: none;
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: #1C1B19;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 7px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
        }
        .nav-link:hover .tooltip {
          display: block;
        }
        .sidebar-divider {
          height: 1px;
          background: #EEECEA;
          margin: 8px 0;
        }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? 64 : 228,
        background: '#fff',
        borderRight: '1px solid #EEECEA',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #EEECEA',
          gap: 8,
        }}>
          {!collapsed && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #378ADD, #1D9E75)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>📊</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1C1B19', letterSpacing: '-0.02em' }}>
                  SmartSalesAI
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #378ADD, #1D9E75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>📊</div>
          )}
          {!collapsed && (
            <button className="collapse-btn" onClick={() => setCollapsed(true)} title="Collapse sidebar">
              ←
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid #EEECEA' }}>
            <button className="collapse-btn" onClick={() => setCollapsed(false)} title="Expand sidebar">
              →
            </button>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {!collapsed && (
            <p style={{
              fontSize: 10, fontWeight: 600, color: '#B0AEA8',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              margin: '0 6px 8px', padding: '0 8px',
            }}>Menu</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {collapsed && <span className="tooltip">{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid #EEECEA',
        }}>
          {!collapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 10,
              background: '#FAFAF8',
              marginBottom: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #378ADD, #7F77DD)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1B19', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'User'}
                </p>
                <p style={{ fontSize: 11, color: '#888780', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'user@email.com'}
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #378ADD, #7F77DD)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                {initials}
              </div>
            </div>
          )}

          <button className="logout-btn" onClick={logout} style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span style={{ fontSize: 15 }}>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;