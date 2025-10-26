"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NextNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-brand">NotifyPWA</Link>
        <ul className="navbar-nav">
          {user ? (
            <>
              {user.role === 'admin_master' ? (
                <>
                  <li className="nav-item">
                    <Link href="/admin/dashboard" className="nav-link">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/admin/users" className="nav-link">Users</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link href="/client/dashboard" className="nav-link">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/client/notifications" className="nav-link">Notifications</Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/client/notifications/new" className="nav-link">New Notification</Link>
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
                <Link href="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link href="/register" className="nav-link">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}