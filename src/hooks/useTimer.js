import { useState, useEffect, useRef, useCallback } from 'react';
import { MODES } from '../app/constants';

export const useTimer = (initialDurationMinutes = 45) => {
  const [targetDuration, setTargetDuration] = useState(initialDurationMinutes * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(new URL('../worker/timer.worker.js', import.meta.url));

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'TICK') {
        setElapsedSeconds(prev => prev + 1);
      }
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const start = useCallback(() => {
    setIsActive(true);
    workerRef.current.postMessage({ command: 'START' });
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setElapsedSeconds(0); 
    workerRef.current.postMessage({ command: 'STOP' });
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
    workerRef.current.postMessage({ command: 'STOP' }); 
  }, []);
  
  const addFiveMinutes = useCallback(() => {
    setTargetDuration(prev => prev + (5 * 60));
  }, []);

  const setDuration = useCallback((minutes) => {
    setTargetDuration(minutes * 60);
    setElapsedSeconds(0);
  }, []);

  // Derived state
  const remaining = targetDuration - elapsedSeconds;
  const isOvertime = remaining < 0;
  const mode = isOvertime ? MODES.FLOW : MODES.FOCUS;
  
  // Format for display
  const formatTime = (totalSeconds) => {
    const absSeconds = Math.abs(totalSeconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    
    const fmt = (n) => n.toString().padStart(2, '0');
    return `${fmt(m)}:${fmt(s)}`;
  };

  return {
    isActive,
    isOvertime,
    mode, // Exposed mode
    timeDisplay: formatTime(remaining),
    elapsedSeconds,
    targetDuration,
    start,
    stop,
    pause,
    addFiveMinutes,
    setDuration,
    reset: () => setElapsedSeconds(0)
  };
};
