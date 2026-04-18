import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api';
import AdminNavbar from '../Components/AdminNavbar';
import './AdminDashboard.css';

const EmptyState = ({ text }) => <div className="admin-empty">{text}</div>;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [unassigned, setUnassigned] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userFilter, setUserFilter] = useState({ search: '', userType: '', status: '' });
  const [reportFilter, setReportFilter] = useState({ status: 'open', targetType: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignmentMap, setAssignmentMap] = useState({});
  const navigate = useNavigate();

  const canRender = useMemo(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) return false;

    try {
      const user = JSON.parse(userRaw);
      return user?.role === 'admin';
    } catch {
      return false;
    }
  }, []);

  const fetchInitial = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, bookingRes, reportRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUnassignedBookings(),
        adminAPI.getReports(reportFilter)
      ]);

      setDashboard(dashboardRes.data);
      setUnassigned(bookingRes.data || []);
      setReports(reportRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers(userFilter);
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    }
  };

  useEffect(() => {
    if (!canRender) {
      navigate('/admin-login');
      return;
    }

    fetchInitial();
    fetchUsers();
  }, [canRender]);

  useEffect(() => {
    if (canRender) {
      fetchUsers();
    }
  }, [userFilter.search, userFilter.userType, userFilter.status]);

  useEffect(() => {
    if (canRender) {
      fetchInitial();
    }
  }, [reportFilter.status, reportFilter.targetType]);

  const handleAssign = async (bookingId, serviceType) => {
    const professionalId = assignmentMap[bookingId];
    if (!professionalId) {
      setError('Select a professional before assigning');
      return;
    }

    try {
      await adminAPI.assignBooking(bookingId, professionalId);
      await fetchInitial();
      await loadAssignablePros(serviceType);
    } catch (err) {
      setError(err.message || 'Failed to assign booking');
    }
  };

  const loadAssignablePros = async (serviceType) => {
    try {
      const res = await adminAPI.getAssignableProfessionals(serviceType);
      setProfessionals(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load professionals');
    }
  };

  const toggleUser = async (userId, isActive) => {
    try {
      await adminAPI.updateUserStatus(userId, !isActive);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const reviewReport = async (reportId, action, status = 'resolved') => {
    try {
      await adminAPI.reviewReport(reportId, {
        status,
        action,
        note:
          action === 'suspended'
            ? 'Suspended after report review'
            : action === 'reactivated'
              ? 'Reactivated after review'
              : status === 'in-review'
                ? 'Marked as in-review by admin'
                : 'Resolved without suspension'
      });
      await fetchInitial();
    } catch (err) {
      setError(err.message || 'Failed to review report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  if (!canRender) {
    return null;
  }

  return (
    <div className="admin-layout">
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="admin-content">
        <header className="admin-header">
          <h1>Administration Panel</h1>
          <button type="button" onClick={fetchInitial}>Refresh</button>
        </header>

        {error && <div className="admin-error">{error}</div>}
        {loading && <div className="admin-loading">Loading admin data...</div>}

        {!loading && activeTab === 'overview' && dashboard && (
          <section>
            <div className="admin-grid">
              <article className="stat-card"><h3>Total Users</h3><p>{dashboard.stats.totalUsers}</p></article>
              <article className="stat-card"><h3>Total Customers</h3><p>{dashboard.stats.totalCustomers}</p></article>
              <article className="stat-card"><h3>Professionals</h3><p>{dashboard.stats.totalProfessionals}</p></article>
              <article className="stat-card"><h3>Active Professionals</h3><p>{dashboard.stats.activeProfessionals}</p></article>
              <article className="stat-card"><h3>Total Bookings</h3><p>{dashboard.stats.totalBookings}</p></article>
              <article className="stat-card"><h3>Unassigned Tasks</h3><p>{dashboard.stats.unassignedBookings}</p></article>
              <article className="stat-card"><h3>Pending Tasks</h3><p>{dashboard.stats.pendingBookings}</p></article>
              <article className="stat-card"><h3>In Progress</h3><p>{dashboard.stats.inProgressBookings}</p></article>
              <article className="stat-card"><h3>Completed Tasks</h3><p>{dashboard.stats.completedBookings}</p></article>
              <article className="stat-card"><h3>Open Reports</h3><p>{dashboard.stats.openReports}</p></article>
              <article className="stat-card"><h3>Total Reports</h3><p>{dashboard.stats.totalReports}</p></article>
              <article className="stat-card"><h3>Contacts</h3><p>{dashboard.stats.totalContacts}</p></article>
              <article className="stat-card"><h3>FAQs</h3><p>{dashboard.stats.totalFaqs}</p></article>
              <article className="stat-card"><h3>Newsletter Subs</h3><p>{dashboard.stats.totalNewsletters}</p></article>
            </div>

            <div className="overview-list">
              <h3>Recent Bookings</h3>
              {dashboard.recentBookings?.length ? dashboard.recentBookings.map((booking) => (
                <div className="card-row" key={booking._id}>
                  <div>
                    <strong>{booking.service?.type} - {booking.service?.name}</strong>
                    <p>{booking.customer?.name} | {booking.customer?.email}</p>
                    <small>Status: {booking.status} | Assigned: {booking.professional?.name || 'Not assigned'}</small>
                  </div>
                  <small>{new Date(booking.createdAt).toLocaleString()}</small>
                </div>
              )) : <EmptyState text="No recent bookings." />}
            </div>
          </section>
        )}

        {!loading && activeTab === 'assignments' && (
          <section>
            <h2>Assign Unclaimed Tasks</h2>
            {unassigned.length === 0 && <EmptyState text="No unassigned bookings right now." />}
            {unassigned.map((booking) => (
              <div className="card-row" key={booking._id}>
                <div>
                  <strong>{booking.service?.type} - {booking.service?.name}</strong>
                  <p>{booking.customer?.name} | {booking.customer?.phone} | {booking.customer?.email}</p>
                  <small>{booking.schedule?.date} {booking.schedule?.time} | Emergency: {booking.schedule?.isEmergency ? 'Yes' : 'No'}</small>
                  <small>{booking.address?.street}, {booking.address?.city}</small>
                </div>
                <div className="assign-controls">
                  <button
                    type="button"
                    onClick={() => loadAssignablePros(booking.service?.type)}
                  >
                    Load Professionals
                  </button>
                  <select
                    value={assignmentMap[booking._id] || ''}
                    onChange={(event) => setAssignmentMap((prev) => ({ ...prev, [booking._id]: event.target.value }))}
                  >
                    <option value="">Select professional</option>
                    {professionals.map((pro) => (
                      <option key={pro._id} value={pro._id}>{pro.name} - {pro.profession}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => handleAssign(booking._id, booking.service?.type)}>Assign</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {!loading && activeTab === 'users' && (
          <section>
            <h2>User and Professional Moderation</h2>
            <div className="toolbar-row">
              <input
                value={userFilter.search}
                onChange={(event) => setUserFilter((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="Search by name, email, or phone"
              />
              <select
                value={userFilter.userType}
                onChange={(event) => setUserFilter((prev) => ({ ...prev, userType: event.target.value }))}
              >
                <option value="">All types</option>
                <option value="customer">Customer</option>
                <option value="professional">Professional</option>
              </select>
              <select
                value={userFilter.status}
                onChange={(event) => setUserFilter((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {users.length === 0 && <EmptyState text="No users found." />}
            {users.map((user) => (
              <div className="card-row" key={user._id}>
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.email} | {user.phone}</p>
                  <small>{user.userType} | Role: {user.role || 'user'} | {user.isActive ? 'Active' : 'Inactive'}</small>
                  <small>Profession: {user.profession || 'N/A'} | Experience: {user.experience || 'N/A'}</small>
                </div>
                <button
                  type="button"
                  className={user.isActive ? 'danger' : 'success'}
                  onClick={() => toggleUser(user._id, user.isActive)}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </section>
        )}

        {!loading && activeTab === 'reports' && (
          <section>
            <h2>Reported Users and Professionals</h2>
            <div className="toolbar-row">
              <select
                value={reportFilter.status}
                onChange={(event) => setReportFilter((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="open">Open</option>
                <option value="in-review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={reportFilter.targetType}
                onChange={(event) => setReportFilter((prev) => ({ ...prev, targetType: event.target.value }))}
              >
                <option value="">All target types</option>
                <option value="customer">Customer</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            {reports.length === 0 && <EmptyState text="No open reports." />}
            {reports.map((report) => (
              <div className="card-row" key={report._id}>
                <div>
                  <strong>{report.reason} | Status: {report.status}</strong>
                  <p>Reported: {report.target?.name} ({report.target?.userType}) | Target email: {report.target?.email}</p>
                  <small>Reporter: {report.reporter?.name} ({report.reporter?.email})</small>
                  <small>Booking: {report.bookingId || 'N/A'} | Created: {new Date(report.createdAt).toLocaleString()}</small>
                  <small>{report.details}</small>
                </div>
                <div className="assign-controls">
                  <button type="button" onClick={() => reviewReport(report._id, 'none', 'in-review')}>Mark In Review</button>
                  <button type="button" className="danger" onClick={() => reviewReport(report._id, 'suspended', 'resolved')}>Suspend</button>
                  <button type="button" className="success" onClick={() => reviewReport(report._id, 'reactivated', 'resolved')}>Reactivate</button>
                  <button type="button" onClick={() => reviewReport(report._id, 'none', 'resolved')}>Resolve</button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
