import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { professionalAPI, chatAPI } from '../../api';
import './ProfessionalDashboard.css';

const serviceIcons = {
  Plumbing: '🔧', Electrical: '⚡', Carpentry: '🪚',
  Cleaning: '🧹', Painting: '🎨', HVAC: '❄️',
  Moving: '🚛', Gardening: '🌳', Tutoring: '📚', Handyman: '🔨'
};

const statusConfig = {
  pending:     { label: 'Pending',     cls: 'badge-pending' },
  accepted:    { label: 'Accepted',    cls: 'badge-accepted' },
  'in-progress':{ label: 'In Progress', cls: 'badge-inprogress' },
  completed:   { label: 'Completed',   cls: 'badge-completed' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-cancelled' },
  rejected:    { label: 'Rejected',    cls: 'badge-rejected' },
};

const professionIconMap = {
  Plumber: '🔧',
  Electrician: '⚡',
  Carpenter: '🪚',
  Cleaner: '🧹',
  Painter: '🎨',
  'HVAC Technician': '❄️',
  'Moving Specialist': '🚛',
  Gardener: '🌳',
  Tutor: '📚',
  Handyman: '🔨'
};

const formatDate = (d) => {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const formatPrice = (p) => `₹${(p || 0).toLocaleString()}`;
const getMapsLink = (lat, lng) => `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const user   = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();

  const [activeTab, setActiveTab]         = useState('available');
  const [available, setAvailable]         = useState([]);
  const [myJobs, setMyJobs]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError]                 = useState('');
  const [toast, setToast]                 = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [dateFilter, setDateFilter]       = useState('all');
  const [sortBy, setSortBy]               = useState('newest');
  const [chatMetaByBooking, setChatMetaByBooking] = useState({});
  const [locationSharingByJob, setLocationSharingByJob] = useState({});
  const [locationActionByJob, setLocationActionByJob] = useState({});

  const locationWatchRef = useRef({});
  const locationErrorCooldownRef = useRef({});

  // Detail modal state
  const [detailBooking, setDetailBooking] = useState(null);

  // If not a professional, redirect
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.userType !== 'professional') { navigate('/bookings'); return; }
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [avail, jobs] = await Promise.all([
        professionalAPI.getAvailableJobs(),
        professionalAPI.getMyJobs()
      ]);
      setAvailable(avail.bookings || []);
      setMyJobs(jobs.bookings || []);
      const nextSharingState = (jobs.bookings || []).reduce((acc, booking) => {
        acc[booking._id] = Boolean(booking.tracking?.isSharing || locationWatchRef.current[booking._id]);
        return acc;
      }, {});
      setLocationSharingByJob(nextSharingState);

      try {
        const inbox = await chatAPI.getInbox();
        const mapped = (inbox.inbox || []).reduce((acc, item) => {
          acc[String(item.bookingId)] = item;
          return acc;
        }, {});
        setChatMetaByBooking(mapped);
      } catch {
        setChatMetaByBooking({});
      }
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    return () => {
      const watchIds = Object.values(locationWatchRef.current);
      watchIds.forEach((watchId) => {
        if (navigator.geolocation && typeof navigator.geolocation.clearWatch === 'function') {
          navigator.geolocation.clearWatch(watchId);
        }
      });
      locationWatchRef.current = {};
      locationErrorCooldownRef.current = {};
    };
  }, []);

  const handleStopLocationSharing = useCallback(async (bookingId, options = {}) => {
    setLocationActionByJob((prev) => ({ ...prev, [bookingId]: 'stopping' }));

    const watchId = locationWatchRef.current[bookingId];
    if (watchId && navigator.geolocation && typeof navigator.geolocation.clearWatch === 'function') {
      navigator.geolocation.clearWatch(watchId);
    }

    delete locationWatchRef.current[bookingId];
    setLocationSharingByJob((prev) => ({ ...prev, [bookingId]: false }));

    try {
      await professionalAPI.stopJobLocation(bookingId);
      if (!options.silent) {
        showToast('Live location sharing stopped.');
      }
    } catch (error) {
      if (!options.silent) {
        showToast(error.message || 'Failed to stop location sharing', 'error');
      }
    } finally {
      setLocationActionByJob((prev) => ({ ...prev, [bookingId]: null }));
    }
  }, []);

  const handleStartLocationSharing = useCallback(async (job) => {
    const bookingId = job?._id;
    if (!bookingId) return;

    if (!['accepted', 'in-progress'].includes(job.status)) {
      showToast('Location sharing is only available for accepted or in-progress jobs.', 'error');
      return;
    }

    if (!navigator.geolocation || typeof navigator.geolocation.watchPosition !== 'function') {
      showToast('Geolocation is not supported in this browser.', 'error');
      return;
    }

    if (!window.isSecureContext) {
      showToast('Live location needs a secure context (HTTPS or localhost).', 'error');
      return;
    }

    if (locationWatchRef.current[bookingId]) {
      showToast('Live location sharing is already active for this job.');
      return;
    }

    setLocationActionByJob((prev) => ({ ...prev, [bookingId]: 'requesting' }));

    if (navigator.permissions && typeof navigator.permissions.query === 'function') {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setLocationActionByJob((prev) => ({ ...prev, [bookingId]: null }));
          showToast('Location permission is blocked. Please allow location access in browser settings.', 'error');
          return;
        }
      } catch {
        // Continue and let getCurrentPosition handle permission prompt.
      }
    }

    const pushLocation = async (coords) => {
      try {
        await professionalAPI.updateJobLocation(bookingId, {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          heading: coords.heading,
          speed: coords.speed
        });
      } catch (error) {
        if (!locationErrorCooldownRef.current[bookingId]) {
          locationErrorCooldownRef.current[bookingId] = true;
          showToast(error.message || 'Failed to send live location update', 'error');
          setTimeout(() => {
            locationErrorCooldownRef.current[bookingId] = false;
          }, 5000);
        }
      }
    };

    const firstPosition = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    }).catch((error) => {
      const message = error?.message || 'Location permission was not granted.';
      showToast(message, 'error');
      return null;
    });

    if (!firstPosition) {
      setLocationActionByJob((prev) => ({ ...prev, [bookingId]: null }));
      return;
    }

    await pushLocation(firstPosition.coords);
    try {
      const mapLink = getMapsLink(firstPosition.coords.latitude, firstPosition.coords.longitude);
      await chatAPI.sendMessage(
        bookingId,
        `📍 Live location shared by professional: ${mapLink}`
      );
    } catch {
      // Location updates continue even if chat message fails.
    }
    setLocationSharingByJob((prev) => ({ ...prev, [bookingId]: true }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        pushLocation(position.coords);
      },
      async (error) => {
        await handleStopLocationSharing(bookingId, { silent: true });
        const message = error?.message || 'Could not access your live location. Check browser permissions.';
        showToast(message, 'error');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );

    locationWatchRef.current[bookingId] = watchId;
    setLocationActionByJob((prev) => ({ ...prev, [bookingId]: null }));
    showToast('Live location sharing started for this job.');
  }, [handleStopLocationSharing]);

  const handleAccept = async (bookingId) => {
    setActionLoading(p => ({ ...p, [bookingId]: 'accepting' }));
    try {
      await professionalAPI.acceptJob(bookingId);
      showToast('Job accepted! Check "My Work" tab.');
      await loadData();
      setActiveTab('mywork');
    } catch (e) {
      showToast(e.message || 'Failed to accept job', 'error');
    } finally {
      setActionLoading(p => ({ ...p, [bookingId]: null }));
    }
  };

  const handleReject = async (bookingId) => {
    setActionLoading(p => ({ ...p, [bookingId]: 'rejecting' }));
    try {
      if (locationWatchRef.current[bookingId]) {
        await handleStopLocationSharing(bookingId, { silent: true });
      }
      const reason = window.prompt('Reason for declining this job (optional):', 'Declined by professional') || 'Declined by professional';
      await professionalAPI.rejectJob(bookingId, reason);
      showToast('Job declined.');
      await loadData();
    } catch (e) {
      showToast(e.message || 'Failed to reject job', 'error');
    } finally {
      setActionLoading(p => ({ ...p, [bookingId]: null }));
    }
  };

  const handleStart = async (bookingId) => {
    setActionLoading(p => ({ ...p, [bookingId]: 'starting' }));
    try {
      await professionalAPI.startJob(bookingId);
      showToast('Job moved to in-progress.');
      await loadData();
    } catch (e) {
      showToast(e.message || 'Failed to start job', 'error');
    } finally {
      setActionLoading(p => ({ ...p, [bookingId]: null }));
    }
  };

  const handleComplete = async (job) => {
    const bookingId = job._id;
    setActionLoading(p => ({ ...p, [bookingId]: 'completing' }));
    try {
      if (locationWatchRef.current[bookingId]) {
        await handleStopLocationSharing(bookingId, { silent: true });
      }

      const currentPrice = job.pricing?.totalPrice || job.pricing?.basePrice || '';
      const entered = window.prompt('Enter final amount in INR (leave blank to keep current amount):', currentPrice ? String(currentPrice) : '');

      if (entered === null) {
        setActionLoading(p => ({ ...p, [bookingId]: null }));
        return;
      }

      let finalPrice;
      if (entered.trim()) {
        finalPrice = Number(entered.trim());
        if (Number.isNaN(finalPrice) || finalPrice < 0) {
          showToast('Please enter a valid amount.', 'error');
          setActionLoading(p => ({ ...p, [bookingId]: null }));
          return;
        }
      }

      await professionalAPI.completeJob(bookingId, finalPrice);
      showToast('Job marked as completed! Great work 🎉');
      await loadData();
    } catch (e) {
      showToast(e.message || 'Failed to complete job', 'error');
    } finally {
      setActionLoading(p => ({ ...p, [bookingId]: null }));
    }
  };

  const handleOpenChat = (job) => {
    navigate(`/chat/${job._id}`);
  };

  // ────── derived stats ──────
  const activeJobs    = myJobs.filter(j => ['accepted', 'in-progress'].includes(j.status));
  const historyJobs   = myJobs.filter(j => ['completed', 'rejected', 'cancelled'].includes(j.status));
  const completedJobs = myJobs.filter(j => j.status === 'completed');
  const totalEarnings = completedJobs.reduce((s, j) => s + (j.pricing?.totalPrice || j.pricing?.basePrice || 0), 0);
  const startedJobs   = myJobs.filter(j => ['accepted', 'in-progress', 'completed'].includes(j.status)).length;
  const completionRate = startedJobs ? Math.round((completedJobs.length / startedJobs) * 100) : 0;
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const lastWeekEarnings = completedJobs
    .filter(j => {
      const doneAt = j.completedAt ? new Date(j.completedAt).getTime() : 0;
      return doneAt >= sevenDaysAgo;
    })
    .reduce((sum, j) => sum + (j.pricing?.totalPrice || j.pricing?.basePrice || 0), 0);
  const avgRating     = completedJobs.filter(j => j.review?.rating).length
    ? (completedJobs.filter(j => j.review?.rating).reduce((s, j) => s + j.review.rating, 0) / completedJobs.filter(j => j.review?.rating).length).toFixed(1)
    : '—';

  const tabData = { available, mywork: activeJobs, history: historyJobs };
  const baseList = tabData[activeTab] || [];

  const displayList = baseList
    .filter(job => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      const values = [
        job.customer?.name,
        job.service?.name,
        job.service?.type,
        job.address?.street,
        job.address?.city,
        job._id
      ].filter(Boolean).join(' ').toLowerCase();
      return values.includes(query);
    })
    .filter(job => {
      if (urgencyFilter === 'emergency') return Boolean(job.schedule?.isEmergency);
      if (urgencyFilter === 'normal') return !job.schedule?.isEmergency;
      return true;
    })
    .filter(job => {
      if (dateFilter === 'all') return true;
      const dateValue = job.schedule?.date ? new Date(job.schedule.date) : null;
      if (!dateValue || Number.isNaN(dateValue.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        return dateValue.toDateString() === today.toDateString();
      }

      if (dateFilter === 'week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return dateValue >= today && dateValue <= weekEnd;
      }

      return true;
    })
    .sort((a, b) => {
      const getScheduleTime = (item) => {
        const value = item.schedule?.date ? new Date(item.schedule.date).getTime() : Number.MAX_SAFE_INTEGER;
        return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
      };
      const getPrice = (item) => item.pricing?.totalPrice || item.pricing?.basePrice || 0;
      const getCreated = (item) => item.createdAt ? new Date(item.createdAt).getTime() : 0;

      if (sortBy === 'soonest') return getScheduleTime(a) - getScheduleTime(b);
      if (sortBy === 'price-high') return getPrice(b) - getPrice(a);
      if (sortBy === 'emergency-first') return Number(Boolean(b.schedule?.isEmergency)) - Number(Boolean(a.schedule?.isEmergency));
      return getCreated(b) - getCreated(a);
    });

  // ────── RENDER ──────
  return (
    <div className="pro-dashboard">

      {/* ── Toast ── */}
      {toast && (
        <div className={`pro-toast ${toast.type === 'error' ? 'pro-toast-error' : 'pro-toast-success'}`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      {/* ── Hero Header ── */}
      <div className="pro-hero">
        <div className="pro-hero-overlay" />
        <div className="pro-hero-content">
          <div className="pro-hero-avatar">
            {user?.profileImage
              ? <img src={user.profileImage} alt={user.name} />
              : <span>{(user?.name || 'P').charAt(0).toUpperCase()}</span>}
          </div>
          <div className="pro-hero-info">
            <h1>Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋</h1>
            <p className="pro-subtitle">
              {professionIconMap[user?.profession] || '🛠️'}&nbsp;
              {user?.profession || 'Professional'} &nbsp;·&nbsp; ⭐ {avgRating} avg rating
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="pro-stats-row">
          {[
            { icon: '📋', val: available.length, label: 'Available Jobs' },
            { icon: '🔨', val: activeJobs.length,    label: 'Active Jobs' },
            { icon: '✅', val: completedJobs.length,  label: 'Completed' },
            { icon: '💰', val: formatPrice(totalEarnings), label: 'Total Earned' },
            { icon: '📈', val: `${completionRate}%`, label: 'Completion Rate' },
            { icon: '🗓️', val: formatPrice(lastWeekEarnings), label: 'Last 7 Days' },
          ].map(s => (
            <div className="pro-stat-card" key={s.label}>
              <span className="pro-stat-icon">{s.icon}</span>
              <strong>{s.val}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="pro-main">

        {/* Tabs */}
        <div className="pro-tabs">
          {[
            { id: 'available', label: `Available Jobs`, badge: available.length },
            { id: 'mywork',    label: 'My Work',        badge: activeJobs.length },
            { id: 'history',   label: 'History',        badge: historyJobs.length },
          ].map(t => (
            <button
              key={t.id}
              className={`pro-tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              {t.badge > 0 && <span className="pro-tab-badge">{t.badge}</span>}
            </button>
          ))}
          <button className="pro-refresh-btn" onClick={loadData} title="Refresh">🔄</button>
        </div>

        {/* Tab description */}
        <p className="pro-tab-desc">
          {activeTab === 'available' && `Pending ${user?.profession ? `${user.profession.replace(' Specialist','').replace(' Technician','')} ` : ''}service requests waiting to be picked up.`}
          {activeTab === 'mywork'    && 'Jobs you have accepted and are currently working on.'}
          {activeTab === 'history'   && 'Completed and declined jobs from your past work.'}
        </p>

        {!loading && !error && (
          <div className="pro-filters">
            <input
              type="text"
              className="pro-filter-input"
              placeholder="Search by customer, service, city, booking ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select className="pro-filter-select" value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
              <option value="all">All Priority</option>
              <option value="emergency">Emergency Only</option>
              <option value="normal">Normal Only</option>
            </select>

            <select className="pro-filter-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="week">Next 7 Days</option>
            </select>

            <select className="pro-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="soonest">Schedule Soonest</option>
              <option value="price-high">Highest Value</option>
              <option value="emergency-first">Emergency First</option>
            </select>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="pro-loading">
            <div className="pro-spinner" />
            <p>Loading jobs...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="pro-error">
            <p>⚠️ {error}</p>
            <button onClick={loadData}>Try Again</button>
          </div>
        )}

        {/* Job cards */}
        {!loading && !error && (
          <>
            {displayList.length === 0 ? (
              <div className="pro-empty">
                <span className="pro-empty-icon">
                  {activeTab === 'available' ? '📭' : activeTab === 'mywork' ? '🛠️' : '📜'}
                </span>
                <h3>
                  {activeTab === 'available' && 'No available jobs right now'}
                  {activeTab === 'mywork'    && 'No active jobs'}
                  {activeTab === 'history'   && 'No job history yet'}
                </h3>
                <p>
                  {activeTab === 'available' && 'Check back soon — new service requests appear here in real-time.'}
                  {activeTab === 'mywork'    && 'Accept jobs from the "Available Jobs" tab to see them here.'}
                  {activeTab === 'history'   && 'Completed jobs will appear here once you finish your first assignment.'}
                </p>
              </div>
            ) : (
              <div className="pro-job-list">
                {displayList.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    tab={activeTab}
                    actionLoading={actionLoading}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onStart={handleStart}
                    onComplete={handleComplete}
                    onStartLocation={handleStartLocationSharing}
                    onStopLocation={handleStopLocationSharing}
                    onDetail={setDetailBooking}
                    onOpenChat={handleOpenChat}
                    chatMeta={chatMetaByBooking[job._id]}
                    isLocationSharing={Boolean(locationSharingByJob[job._id])}
                    locationAction={locationActionByJob[job._id]}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailBooking && (
        <DetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Job Card Component
───────────────────────────────────────── */
function JobCard({
  job,
  tab,
  actionLoading,
  onAccept,
  onReject,
  onStart,
  onComplete,
  onStartLocation,
  onStopLocation,
  onDetail,
  onOpenChat,
  chatMeta,
  isLocationSharing,
  locationAction
}) {
  const id = job._id;
  const busy = actionLoading[id];
  const sc = statusConfig[job.status] || { label: job.status, cls: 'badge-pending' };
  const unreadCount = chatMeta?.unreadCount || 0;
  const lastMessageText = chatMeta?.lastMessage?.text || '';

  const isLocationBusy = locationAction === 'requesting' || locationAction === 'stopping';

  return (
    <div className={`pro-job-card ${job.schedule?.isEmergency ? 'emergency' : ''}`}>
      {job.schedule?.isEmergency && <span className="emergency-ribbon">🚨 EMERGENCY</span>}

      {/* Card header */}
      <div className="pjc-header">
        <div className="pjc-service">
          <span className="pjc-icon">{serviceIcons[job.service?.type] || '🔧'}</span>
          <div>
            <h3>{job.service?.name || job.service?.type}</h3>
            <span className={`pro-badge ${sc.cls}`}>{sc.label}</span>
          </div>
        </div>
        <div className="pjc-id">#{(id || '').slice(-6).toUpperCase()}</div>
      </div>

      {/* Customer info */}
      <div className="pjc-customer">
        <span>👤</span>
        <div>
          {tab === 'available' ? (
            <strong>{job.customer?.name}</strong>
          ) : (
            <button type="button" className="pjc-customer-link" onClick={() => onOpenChat(job)}>
              {job.customer?.name}
            </button>
          )}
          <span>&nbsp;·&nbsp;{job.customer?.phone}</span>
          {tab !== 'available' && <span>&nbsp;·&nbsp;{job.customer?.email}</span>}
        </div>
      </div>

      {tab !== 'available' && lastMessageText && (
        <p className="pjc-chat-preview">Last message: {lastMessageText}</p>
      )}

      {/* Meta row */}
      <div className="pjc-meta">
        <span>📅 {formatDate(job.schedule?.date)}</span>
        <span>🕐 {job.schedule?.time || 'Flexible'}</span>
        <span>📍 {(job.address?.street || 'Address not specified').substring(0, 35)}{job.address?.city ? `, ${job.address.city}` : ''}</span>
      </div>

      {tab !== 'available' && (
        <div className={`pjc-location-state ${isLocationSharing ? 'active' : ''}`}>
          {isLocationSharing ? '📡 Live location sharing is ON' : '📍 Live location sharing is OFF'}
        </div>
      )}

      {/* Description */}
      {job.service?.description && (
        <p className="pjc-desc">"{job.service.description}"</p>
      )}

      {/* Pricing */}
      {(job.pricing?.basePrice > 0) && (
        <div className="pjc-price">💰 {formatPrice(job.pricing.totalPrice || job.pricing.basePrice)}</div>
      )}

      {/* Actions */}
      <div className="pjc-actions">
        <button className="pjc-btn pjc-btn-outline" onClick={() => onDetail(job)}>
          View Details
        </button>

        {tab === 'available' && (
          <>
            <button
              className="pjc-btn pjc-btn-accept"
              onClick={() => onAccept(id)}
              disabled={!!busy}
            >
              {busy === 'accepting' ? 'Accepting...' : '✅ Accept Job'}
            </button>
            <button
              className="pjc-btn pjc-btn-reject"
              onClick={() => onReject(id)}
              disabled={!!busy}
            >
              {busy === 'rejecting' ? 'Declining...' : '✗ Decline'}
            </button>
          </>
        )}

        {tab === 'mywork' && job.status === 'accepted' && (
          <>
            <button
              className={`pjc-btn ${isLocationSharing ? 'pjc-btn-location-stop' : 'pjc-btn-location-start'}`}
              onClick={() => (isLocationSharing ? onStopLocation(id) : onStartLocation(job))}
              disabled={!!busy || isLocationBusy}
            >
              {locationAction === 'requesting'
                ? '📍 Requesting permission...'
                : locationAction === 'stopping'
                  ? '🛑 Stopping...'
                  : isLocationSharing
                    ? '🛑 Stop Live GPS'
                    : '📡 Turn ON Live GPS'}
            </button>
            <button
              className="pjc-btn pjc-btn-start"
              onClick={() => onStart(id)}
              disabled={!!busy}
            >
              {busy === 'starting' ? 'Starting...' : '▶ Start Work'}
            </button>
            <button
              className="pjc-btn pjc-btn-reject"
              onClick={() => onReject(id)}
              disabled={!!busy}
            >
              {busy === 'rejecting' ? 'Declining...' : '✗ Decline'}
            </button>
          </>
        )}

        {tab === 'mywork' && job.status === 'in-progress' && (
          <>
            <button
              className={`pjc-btn ${isLocationSharing ? 'pjc-btn-location-stop' : 'pjc-btn-location-start'}`}
              onClick={() => (isLocationSharing ? onStopLocation(id) : onStartLocation(job))}
              disabled={!!busy || isLocationBusy}
            >
              {locationAction === 'requesting'
                ? '📍 Requesting permission...'
                : locationAction === 'stopping'
                  ? '🛑 Stopping...'
                  : isLocationSharing
                    ? '🛑 Stop Live GPS'
                    : '📡 Turn ON Live GPS'}
            </button>
            <button
              className="pjc-btn pjc-btn-complete"
              onClick={() => onComplete(job)}
              disabled={!!busy}
            >
              {busy === 'completing' ? 'Marking...' : '🏁 Mark Complete'}
            </button>
          </>
        )}

        {tab === 'history' && job.review?.rating && (
          <div className="pjc-rating">
            {'★'.repeat(job.review.rating)}{'☆'.repeat(5 - job.review.rating)}
            {job.review.comment && <span> "{job.review.comment}"</span>}
          </div>
        )}

        {tab !== 'available' && (
          <button className="pjc-btn pjc-btn-chat" onClick={() => onOpenChat(job)}>
            💬 Chat
            {unreadCount > 0 && <span className="pro-chat-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Detail Modal Component
───────────────────────────────────────── */
function DetailModal({ booking: b, onClose }) {
  const sc = statusConfig[b.status] || { label: b.status, cls: 'badge-pending' };
  return (
    <div className="pro-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pro-modal">
        <button className="pro-modal-close" onClick={onClose}>×</button>
        <h2>Job Details <span className={`pro-badge ${sc.cls}`}>{sc.label}</span></h2>

        <section>
          <h4>🛠 Service</h4>
          <Row label="Type"        val={b.service?.type} />
          <Row label="Description" val={b.service?.description} />
          {b.service?.subService && <Row label="Sub-service" val={b.service.subService} />}
          {b.schedule?.isEmergency && <Row label="Emergency" val="Yes 🚨" />}
        </section>

        <section>
          <h4>👤 Customer</h4>
          <Row label="Name"  val={b.customer?.name} />
          <Row label="Phone" val={b.customer?.phone} />
          <Row label="Email" val={b.customer?.email} />
        </section>

        <section>
          <h4>📅 Schedule</h4>
          <Row label="Date" val={formatDate(b.schedule?.date)} />
          <Row label="Time" val={b.schedule?.time || 'Flexible'} />
        </section>

        <section>
          <h4>📍 Address</h4>
          <Row label="Street" val={b.address?.street} />
          {b.address?.city    && <Row label="City"    val={b.address.city} />}
          {b.address?.zipCode && <Row label="Pincode" val={b.address.zipCode} />}
        </section>

        {(b.pricing?.basePrice > 0) && (
          <section>
            <h4>💰 Pricing</h4>
            <Row label="Base Price" val={formatPrice(b.pricing.basePrice)} />
            {b.pricing.additionalCharges > 0 && <Row label="Extra Charges" val={formatPrice(b.pricing.additionalCharges)} />}
            <Row label="Total" val={formatPrice(b.pricing.totalPrice || b.pricing.basePrice)} />
          </section>
        )}

        {b.review?.rating && (
          <section>
            <h4>⭐ Customer Review</h4>
            <Row label="Rating" val={'★'.repeat(b.review.rating) + '☆'.repeat(5 - b.review.rating)} />
            {b.review.comment && <Row label="Comment" val={`"${b.review.comment}"`} />}
          </section>
        )}

        <button className="pjc-btn pjc-btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ label, val }) {
  return (
    <div className="pro-detail-row">
      <span className="pro-detail-label">{label}</span>
      <span className="pro-detail-val">{val || '—'}</span>
    </div>
  );
}
