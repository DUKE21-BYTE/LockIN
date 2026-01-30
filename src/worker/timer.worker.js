/* eslint-disable no-restricted-globals */
let intervalId = null;

self.onmessage = (e) => {
  const { command } = e.data;

  if (command === 'START') {
    if (intervalId) return; // Already running
    // 1000ms = 1 second
    intervalId = setInterval(() => {
      self.postMessage({ type: 'TICK' });
    }, 1000);
  } else if (command === 'STOP') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};