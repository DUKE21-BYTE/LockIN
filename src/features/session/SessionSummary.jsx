import React from 'react';
import { History, Trash2, Clock } from 'lucide-react';
import './SessionSummary.css';

const SessionSummary = ({ sessions, stats, onClear }) => {
  if (sessions.length === 0) return null;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    return `${m}m`;
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="history-container fade-enter-active">
      <div className="history-header">
        <div className="stats-summary">
          <Clock size={16} className="text-secondary" />
          <span className="stats-text">
            Today: <span className="highlight">{stats.count}</span> sessions 
            <span className="divider">•</span> 
            <span className="highlight">{Math.floor(stats.totalSeconds / 60)}</span> min focused
          </span>
        </div>
        <button onClick={onClear} className="clear-btn" title="Clear History">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="history-list">
        {sessions.slice(0, 5).map(session => (
          <div key={session.id} className="history-item">
            <span className="session-time">{formatTime(session.date)}</span>
            <div className="session-details">
              <span className="duration-pill">
                {formatDuration(session.duration)}
              </span>
              {session.overtime > 0 && (
                <span className="overtime-pill">
                  +{formatDuration(session.overtime)}
                </span>
              )}
            </div>
            <span className="session-label">{session.label || 'Focus'}</span>
          </div>
        ))}
        {sessions.length > 5 && (
          <div className="history-more">
            + {sessions.length - 5} older sessions
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSummary;
