import { useRef, useCallback, useEffect } from 'react';

export const useWakeLock = (shouldLock) => {
  const wakeLockRef = useRef(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  }, []);

  useEffect(() => {
    if (shouldLock) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    
    return () => {
       releaseWakeLock();
    }
  }, [shouldLock, requestWakeLock, releaseWakeLock]);

  // Re-acquire lock if visibility changes (e.g. user switches tabs and comes back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && shouldLock) {
         requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldLock, requestWakeLock]);
};
