import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../../api';
import './ChatInbox.css';

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ChatInbox() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);

  const loadInbox = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await chatAPI.getInbox();
      setConversations(response.inbox || []);
    } catch (err) {
      setError(err.message || 'Failed to load chat inbox');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <div className="chat-inbox-page">
      <div className="chat-inbox-shell">
        <div className="chat-inbox-header">
          <div>
            <h1>Messages</h1>
            <p>
              {user?.userType === 'professional'
                ? 'All your customer conversations for assigned jobs'
                : 'All your conversations with professionals'}
            </p>
          </div>
          <button onClick={loadInbox}>Refresh</button>
        </div>

        {loading && (
          <div className="chat-inbox-state">
            <div className="chat-inbox-loader" />
            <p>Loading conversations...</p>
          </div>
        )}

        {!loading && error && (
          <div className="chat-inbox-state chat-inbox-error">
            <p>{error}</p>
            <button onClick={loadInbox}>Try Again</button>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="chat-inbox-state">
            <h3>No conversations yet</h3>
            <p>Chats will appear here when you or the other party sends a message.</p>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="chat-inbox-list">
            {conversations.map((item) => (
              <button
                key={String(item.bookingId)}
                className="chat-inbox-item"
                onClick={() => navigate(`/chat/${item.bookingId}`)}
              >
                <div className="chat-inbox-main">
                  <div className="chat-inbox-top">
                    <strong>{item.counterpart?.name || 'Chat Participant'}</strong>
                    <span>{formatDateTime(item.lastMessage?.sentAt || item.updatedAt)}</span>
                  </div>
                  <div className="chat-inbox-middle">
                    <span className="chat-inbox-service">{item.booking?.serviceName || 'Service'} · #{String(item.bookingId).slice(-6).toUpperCase()}</span>
                  </div>
                  <p className="chat-inbox-preview">{item.lastMessage?.text || 'No messages yet'}</p>
                </div>
                {item.unreadCount > 0 && (
                  <span className="chat-inbox-unread">{item.unreadCount > 99 ? '99+' : item.unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
