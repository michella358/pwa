import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">NotifyPWA</Link>
        <ul className="navbar-nav">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <li className="nav-item">
                    <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/users" className="nav-link">Users</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/client/dashboard" className="nav-link">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/client/notifications" className="nav-link">Notifications</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/client/notifications/new" className="nav-link">New Notification</Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;