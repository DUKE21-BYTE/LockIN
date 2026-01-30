import React, { useState } from 'react';
import { Play, Square, Plus, Volume2, VolumeX, Lock, Pause, Coffee } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { useAudio } from '../hooks/useAudio';
import { useWakeLock } from '../hooks/useWakeLock';
import { useHistory } from '../hooks/useHistory';
import TimerDisplay from '../features/timer/TimerDisplay';
import SessionSummary from '../features/session/SessionSummary';
import './App.css'; 
import { MODES } from './constants';

const PRESETS = [25, 45, 60, 90];

function App() {
  const { 
    isActive, 
    isOvertime, 
    timeDisplay, 
    elapsedSeconds, 
    targetDuration,
    start, 
    stop,
    pause,
    addFiveMinutes, 
    setDuration,
    reset 
  } = useTimer(45);
  
  const { isPlaying: isAudioPlaying, toggle: toggleAudio, volume, updateVolume } = useAudio();
  useWakeLock(isActive);
  
  // History State
  const { sessions, saveSession, clearHistory, getTodayStats } = useHistory();
  const todayStats = getTodayStats();
  
  const [selectedPreset, setSelectedPreset] = useState(45);
  const [showVolume, setShowVolume] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Sync preset selection
  const handlePresetSelect = (mins) => {
    setSelectedPreset(mins);
    setDuration(mins);
  };
  
  // Calculate progress for the ring
  const remainingSeconds = targetDuration - elapsedSeconds;
  const progress = isActive && !isOvertime 
    ? Math.max(0, remainingSeconds / targetDuration) 
    : 1;

  // Handle Session End (Manual Stop)
  const handleStop = () => {
    const actualDuration = elapsedSeconds;
    const isOvertimeSession = actualDuration > targetDuration;
    const baseDuration = isOvertimeSession ? targetDuration : actualDuration;
    const overTime = isOvertimeSession ? actualDuration - targetDuration : 0;
    
    if (actualDuration > 60) {
      saveSession(baseDuration, overTime, taskInput || 'Focus Session');
    }
    
    stop();
    reset(); 
    setTaskInput(''); 
    setIsPaused(false);
  };
  
  const togglePause = () => {
    if (isPaused) {
        start(); 
        setIsPaused(false);
    } else {
        pause();
        setIsPaused(true);
    }
  };
  
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <Lock size={20} color="var(--color-focus)" />
          <span className="brand-name">Lock<span className="brand-highlight">IN</span></span>
        </div>
        
        <div className="header-controls">
            <a 
              href="https://www.buymeacoffee.com/DENNIS2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="icon-btn support-btn"
              title="Support LockIN"
            >
              <Coffee size={24} />
            </a>

            <div className="audio-control-wrapper" onMouseLeave={() => setShowVolume(false)}>
                {showVolume && (
                  <div className="volume-slider-container fade-enter-active">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume}
                      onChange={(e) => updateVolume(parseFloat(e.target.value))}
                      className="volume-slider"
                    />
                  </div>
                )}
                <button 
                  className={`icon-btn ${isAudioPlaying ? 'active' : ''}`}
                  onClick={toggleAudio}
                  onMouseEnter={() => setShowVolume(true)}
                  title="Brown Noise"
                >
                  {isAudioPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-stage">
        
        <TimerDisplay 
          timeDisplay={timeDisplay} 
          mode={isOvertime ? 'overtime' : 'focus'} 
          progress={progress}
          totalDuration={targetDuration}
        />

        {/* Controls */}
        <div className="controls-area">
          {!isActive ? (
            <div className="setup-controls fade-enter-active">
              <div className="task-input-container">
                  <input
                    type="text"
                    placeholder="What are you locking in on?"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    className="task-input"
                  />
              </div>

              <div className="presets-row">
                {PRESETS.map(mins => (
                  <button 
                    key={mins}
                    className={`preset-chip ${selectedPreset === mins ? 'selected' : ''}`}
                    onClick={() => handlePresetSelect(mins)}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              
              <button className="main-action-btn start-btn" onClick={start}>
                <Play fill="currentColor" size={24} />
                <span>START FOCUS</span>
              </button>
            </div>
          ) : (
            <div className="active-controls fade-enter-active">
               <div className="current-task-label">
                 {taskInput || 'Focus Session'}
               </div>
               
               <div className="primary-actions">
                  <button className="main-action-btn stop-btn" onClick={handleStop}>
                    <Square fill="currentColor" size={24} />
                    <span>STOP</span>
                  </button>

                  <button className="main-action-btn pause-btn" onClick={togglePause}>
                    {isPaused ? (
                        <>
                            <Play fill="currentColor" size={24} />
                            <span>RESUME</span>
                        </>
                    ) : (
                        <>
                            <Pause fill="currentColor" size={24} />
                            <span>PAUSE</span>
                        </>
                    )}
                  </button>
               </div>
              
              <button className="secondary-action-btn extend-btn" onClick={addFiveMinutes}>
                <Plus size={20} />
                <span>+5m</span>
              </button>
            </div>
          )}
        </div>
        
        {/* History Section (Only visible when idle) */}
        {!isActive && (
           <SessionSummary 
             sessions={sessions} 
             stats={todayStats} 
             onClear={clearHistory} 
           />
        )}
      </main>

      <footer className="app-footer">
        <p className="quote">"Deep work is the superpower of the 21st century."</p>
      </footer>
    </div>
  );
}

export default App;
