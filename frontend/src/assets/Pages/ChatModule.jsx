import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import API_BASE_URL, { chatAPI } from '../../api';
import './ChatModule.css';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

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

const renderMessageWithLinks = (text) => {
  const value = String(text || '');
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = value.split(urlRegex);

  return parts.map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-message-link"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={`${index}-${part}`}>{part}</React.Fragment>;
  });
};

export default function ChatModule() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const localUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const [conversation, setConversation] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingName, setTypingName] = useState('');
  const [joinFailed, setJoinFailed] = useState(false);
  const [realtimeError, setRealtimeError] = useState('');

  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const loadConversation = useCallback(async () => {
    if (!bookingId) return;

    try {
      setError('');
      const response = await chatAPI.getBookingChat(bookingId);
      setConversation(response.conversation || null);
      // Mark-read should not block rendering of an already loaded conversation.
      await chatAPI.markAsRead(bookingId).catch(() => {});
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!localUser) {
      navigate('/login', { state: { from: `/chat/${bookingId}` }, replace: true });
      return;
    }

    loadConversation();
  }, [bookingId, loadConversation, localUser, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!bookingId || !token || !localUser) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setJoinFailed(false);
      setRealtimeError('');
      socket.emit('join_booking', { bookingId }, (ack) => {
        if (!ack?.success) {
          setJoinFailed(true);
          setRealtimeError(ack?.message || 'Could not join live chat room');
        }
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('new_message', (payload) => {
      if (payload?.bookingId !== bookingId || !payload?.message) return;

      setConversation((prev) => {
        if (!prev) return prev;

        const exists = prev.messages?.some((msg) => msg._id === payload.message._id);
        if (exists) return prev;

        return {
          ...prev,
          messages: [...(prev.messages || []), payload.message]
        };
      });

      if (payload?.message?.sender?.userId !== localUser?.id) {
        chatAPI.markAsRead(bookingId).catch(() => {});
      }
    });

    socket.on('typing', (payload) => {
      if (payload?.bookingId !== bookingId) return;
      if (payload?.userId === localUser?.id) return;
      setTypingName(payload?.userName || 'User');
    });

    socket.on('stop_typing', (payload) => {
      if (payload?.bookingId !== bookingId) return;
      setTypingName('');
    });

    socket.on('connect_error', () => {
      setRealtimeError('Live connection failed. Messages still work using API fallback.');
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setTypingName('');
      setRealtimeError('');
    };
  }, [bookingId, localUser, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !bookingId || isSending) return;

    setIsSending(true);
    try {
      const socket = socketRef.current;

      if (socket && socket.connected && !joinFailed) {
        await new Promise((resolve, reject) => {
          socket.emit('send_message', { bookingId, text }, (ack) => {
            if (ack?.success) {
              resolve();
              return;
            }
            reject(new Error(ack?.message || 'Could not send message in realtime'));
          });
        });
      } else {
        await chatAPI.sendMessage(bookingId, text);
        await loadConversation();
      }

      setDraft('');
    } catch (err) {
      setError(err.message || 'Could not send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleShareBookingLocation = async () => {
    if (!conversation?.booking?.id || isSending) return;
    if (conversation?.role !== 'customer') {
      setError('Only customers can share booking location from this screen.');
      return;
    }

    const status = conversation?.booking?.status;
    if (!['accepted', 'in-progress'].includes(status)) {
      setError('Location can be shared after the job is accepted.');
      return;
    }

    const bookingAddress = String(conversation?.booking?.address || '').trim();
    if (!bookingAddress) {
      setError('No booking address was found to share.');
      return;
    }

    const mapsLink = `https://www.google.com/maps?q=${encodeURIComponent(bookingAddress)}`;
    const locationMessage = `📍 Customer service location (from booking form): ${bookingAddress}\nMap: ${mapsLink}`;

    setIsSending(true);
    setError('');
    try {
      const socket = socketRef.current;

      if (socket && socket.connected && !joinFailed) {
        await new Promise((resolve, reject) => {
          socket.emit('send_message', { bookingId, text: locationMessage }, (ack) => {
            if (ack?.success) {
              resolve();
              return;
            }
            reject(new Error(ack?.message || 'Could not share location in realtime'));
          });
        });
      } else {
        await chatAPI.sendMessage(bookingId, locationMessage);
        await loadConversation();
      }
    } catch (err) {
      setError(err.message || 'Could not share booking location');
    } finally {
      setIsSending(false);
    }
  };

  const emitTyping = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || joinFailed) return;

    socket.emit('typing', { bookingId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { bookingId });
    }, 1000);
  };

  const messages = conversation?.messages || [];
  const isCustomer = conversation?.role === 'customer';
  const counterpartName = conversation?.counterpart?.name || 'Chat Participant';
  const notAssignedYet = isCustomer && !conversation?.counterpart?.userId;

  return (
    <div className="chat-module-page">
      <div className="chat-shell">
        <div className="chat-header">
          <button className="chat-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="chat-partner-block">
            <h1>{counterpartName}</h1>
            <p>
              Booking #{(conversation?.booking?.id || bookingId || '').slice(-6).toUpperCase()} · {conversation?.booking?.serviceName || 'Service'}
            </p>
          </div>
          <button className="chat-refresh-btn" onClick={loadConversation}>
            Refresh
          </button>
        </div>

        {loading && (
          <div className="chat-state-panel">
            <div className="chat-loader" />
            <p>Loading conversation...</p>
          </div>
        )}

        {!loading && error && (
          <div className="chat-state-panel chat-error-panel">
            <p>{error}</p>
            <button onClick={loadConversation}>Try Again</button>
          </div>
        )}

        {!loading && !error && conversation && (
          <>
            <div className="chat-booking-strip">
              <span>Status: {conversation.booking?.status || 'pending'}</span>
              <span>{conversation.booking?.scheduleDate || 'Flexible date'} {conversation.booking?.scheduleTime || ''}</span>
              <span className={`chat-live-pill ${isConnected ? 'online' : 'offline'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {realtimeError && (
              <div className="chat-note" role="status" aria-live="polite">
                {realtimeError}
              </div>
            )}

            {notAssignedYet && (
              <div className="chat-note">
                A professional is not assigned yet. You can still leave messages and they will be visible once a professional accepts this booking.
              </div>
            )}

            <div className="chat-messages" role="log" aria-live="polite">
              {messages.length === 0 ? (
                <div className="chat-empty-state">
                  <h3>No messages yet</h3>
                  <p>Start the conversation by sending a message below.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender?.userId === localUser?.id;
                  return (
                    <div key={msg._id} className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                      <div className="chat-bubble">
                        <span className="chat-sender">{isMine ? 'You' : (msg.sender?.name || 'User')}</span>
                        <p>{renderMessageWithLinks(msg.text)}</p>
                        <span className="chat-time">{formatDateTime(msg.sentAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}

              {typingName && <div className="chat-typing-indicator">{typingName} is typing...</div>}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-wrap">
              {conversation?.role === 'customer' && ['accepted', 'in-progress'].includes(conversation?.booking?.status) && (
                <button
                  type="button"
                  className="chat-refresh-btn"
                  onClick={handleShareBookingLocation}
                  disabled={isSending}
                >
                  {isSending ? 'Sharing...' : 'Share Booking Address'}
                </button>
              )}
              <textarea
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  emitTyping();
                }}
                placeholder="Type your message..."
                rows={2}
                maxLength={2000}
              />
              <button onClick={handleSend} disabled={isSending || !draft.trim()}>
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
