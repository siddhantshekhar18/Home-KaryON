import React from 'react';
import './AdminNavbar.css';

const AdminNavbar = ({ activeTab, setActiveTab, onLogout }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assignments', label: 'Task Assignment' },
    { id: 'users', label: 'Users & Pros' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <h2>KaryON Admin</h2>
        <p>Operations Console</p>
      </div>

      <nav className="admin-sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <button type="button" className="admin-logout-btn" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
};

export default AdminNavbar;
