import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Initialize Audio Context lazily (browsers block auto-play)
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Create Gain Node for volume
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;
  }, [volume]);

  // Generate Brown Noise Buffer
  const createBrownNoiseBuffer = () => {
    if (!audioCtxRef.current) return null;
    const ctx = audioCtxRef.current;
    
    const bufferSize = ctx.sampleRate * 5; // 5 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5; // Compensate for gain loss
      // Apply simple peak protection/clipping just in case, though brown is usually quiet
      // data[i] *= 3.5; 
    }
    return buffer;
  };

  useEffect(() => {
    // If screen turns off, some browsers suspend AudioContext.
    // We can listen for visibility change and resume if needed.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended' && isPlaying) {
          audioCtxRef.current.resume();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPlaying]);

  const toggle = useCallback(() => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (isPlaying) {
      // Stop
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start
    // --- NODE GRAPH ---

    // 1. Texture: Deep Brown Noise (The "Blocker")
    // Brown noise has -6dB/octave slope, ideal for masking without harshness.
    const buffer = createBrownNoiseBuffer();
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    
    // Low Pass Filter tuned to mask human speech frequencies (approx 300Hz-3kHz)
    // while keeping the rumble soft.
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800; // Increased from 400Hz to catch more mid-range chatter
    noiseFilter.Q.value = 0.5; // Smooth rolloff
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08; // Slightly boosted for better masking presence
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainNodeRef.current);

    // 2. Drone: 40Hz Gamma Isochronic Pulse (Focus Foundation)
    // Neural entrainment research suggests 40Hz promotes binding and focus.
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 40; // Deep Gamma rumble
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 200; // Harmonic overtone for warmth
    
    // Drone Gain
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.05; // Keep it subtle so it doesn't distract
    
    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(gainNodeRef.current);

    // Start all
    noiseSource.start();
    osc1.start();
    osc2.start();
    
    // Store nodes to stop later
    sourceNodeRef.current = { stop: () => {
      noiseSource.stop();
      osc1.stop();
      osc2.stop();
    }};
      setIsPlaying(true);
    }
  }, [isPlaying, initAudio]);

  const updateVolume = useCallback((val) => {
    setVolume(val);
    if (gainNodeRef.current && audioCtxRef.current) {
      // Smooth transition
      gainNodeRef.current.gain.setTargetAtTime(val, audioCtxRef.current.currentTime, 0.1);
    }
  }, []);

  return { isPlaying, toggle, volume, updateVolume };
};
