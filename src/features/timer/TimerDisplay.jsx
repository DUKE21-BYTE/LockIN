import React from 'react';
import './TimerDisplay.css'; // We'll create this specific CSS

const TimerDisplay = ({ timeDisplay, mode, progress }) => {
  const radius = 180;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Progress logic:
  // In Focus: progress goes 0 -> 1 (or 1 -> 0). Let's say 1 -> 0 (full to empty).
  // In Overtime: We might just show a full ring or a pulsing ring.
  
  const strokeDashoffset = mode === 'focus' 
    ? circumference - (progress * circumference) 
    : 0; // Full ring in flow/overtime

  return (
    <div className={`timer-container ${mode}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="timer-ring-svg"
      >
        {/* Background Ring */}
        <circle
          stroke="var(--bg-surface-hover)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Active Ring */}
        <circle
          className="timer-ring-progress"
          stroke={mode === 'focus' ? 'var(--color-focus)' : 'var(--color-overtime)'}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="timer-text-overlay">
        <h1 className="timer-digits">{timeDisplay}</h1>
        <p className="timer-label">
          {mode === 'focus' ? 'FOCUS' : 'OVERTIME'}
        </p>
      </div>
    </div>
  );
};

export default TimerDisplay;
