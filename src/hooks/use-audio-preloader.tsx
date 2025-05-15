
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

// Define an interface for audio cache entries that store both the AudioBuffer and HTMLAudioElement
interface AudioCacheEntry {
  buffer?: AudioBuffer;
  audio: HTMLAudioElement;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  retries: number;
}

// Global audio context and cache that persists between component mounts
let audioContext: AudioContext | null = null;
const audioCache: Record<string, AudioCacheEntry> = {};

export interface AudioPreloaderOptions {
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: (error: any) => void;
  maxRetries?: number;
  maxConcurrent?: number; // Maximum number of concurrent audio loads
  debug?: boolean; // Enable debug mode
}

/**
 * Hook to preload and cache audio files using Web Audio API for better performance
 */
export function useAudioPreloader(options?: AudioPreloaderOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUrls, setLoadedUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isAudioContextInitialized, setIsAudioContextInitialized] = useState(false);
  const activeLoadsRef = useRef<number>(0);
  const queuedLoadsRef = useRef<Array<{url: string, priority: boolean, resolve: (success: boolean) => void}>>([]);
  const maxConcurrent = options?.maxConcurrent || 3; // Default to 3 concurrent loads
  const debug = options?.debug || false;
  
  // Debug logger
  const logDebug = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`🔊 [AudioLoader] ${message}`, ...args);
    }
  }, [debug]);
  
  /**
   * Initialize the AudioContext on user interaction
   * This should be called after a user gesture (click, touch, etc.)
   */
  const initializeAudioContext = useCallback(() => {
    if (!audioContext) {
      try {
        logDebug("Initializing AudioContext");
        // Create AudioContext only on user interaction
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        setIsAudioContextInitialized(true);
        
        // Set up audio context state change listener
        audioContext.addEventListener('statechange', () => {
          logDebug(`AudioContext state changed to: ${audioContext?.state}`);
        });
        
        return true;
      } catch (error) {
        console.error("Failed to create AudioContext:", error);
        toast({
          title: "Audio Playback Issue",
          description: "Your browser may have limited audio support. Using fallback mode.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  }, [logDebug]);
  
  /**
   * Process the audio loading queue
   */
  const processQueue = useCallback(() => {
    logDebug(`Processing queue: ${queuedLoadsRef.current.length} items, ${activeLoadsRef.current} active loads`);
    
    while (queuedLoadsRef.current.length > 0 && activeLoadsRef.current < maxConcurrent) {
      const next = queuedLoadsRef.current.shift();
      if (next) {
        const { url, priority, resolve } = next;
        activeLoadsRef.current++;
        
        // Actual loading happens here
        loadAudioFileInternal(url, priority)
          .then(success => {
            activeLoadsRef.current--;
            resolve(success);
            // Process more from queue
            processQueue();
          })
          .catch(() => {
            activeLoadsRef.current--;
            resolve(false);
            // Process more from queue
            processQueue();
          });
      }
    }
  }, [maxConcurrent]);
  
  /**
   * Initialize an audio entry in the cache
   */
  const initAudioEntry = useCallback((url: string): AudioCacheEntry => {
    if (!audioCache[url]) {
      const audio = new Audio();
      audio.preload = "auto"; // Force preloading
      audio.crossOrigin = "anonymous"; // Add CORS support
      
      audioCache[url] = {
        audio,
        loading: false,
        loaded: false,
        error: false,
        retries: 0
      };
    }
    return audioCache[url];
  }, []);

  /**
   * Internal function to load a single audio file into cache without queue management
   */
  const loadAudioFileInternal = useCallback(async (url: string, priority = false): Promise<boolean> => {
    if (!url) return false;
    
    try {
      let entry = initAudioEntry(url);
      
      // If already loaded or loading without priority, skip
      if (entry.loaded) return true;
      if (entry.loading && !priority) return false;
      
      // Mark as loading
      entry.loading = true;
      logDebug(`Loading audio: ${url}`, { priority });
      
      // Initialize AudioContext if needed (but don't force it if not on user interaction)
      if (!audioContext && window.AudioContext) {
        try {
          initializeAudioContext();
        } catch (e) {
          logDebug("AudioContext initialization deferred until user interaction");
        }
      }
      
      // If AudioContext is not available or suspended, fall back to HTML Audio API
      if (!audioContext || audioContext.state === 'suspended') {
        try {
          logDebug(`Using HTML Audio fallback for ${url}`);
          const audio = new Audio(url);
          audio.crossOrigin = "anonymous";
          
          // Set up event listeners
          const loadPromise = new Promise<void>((resolve, reject) => {
            const onLoad = () => {
              logDebug(`HTML Audio loaded: ${url}`);
              resolve();
            };
            
            const onError = (e: ErrorEvent) => {
              logDebug(`HTML Audio error: ${url}`, e);
              reject(e);
            };
            
            audio.addEventListener('canplaythrough', onLoad, { once: true });
            audio.addEventListener('error', onError, { once: true });
            
            // Add timeout to avoid hanging
            setTimeout(() => {
              reject(new Error("Audio load timeout"));
            }, 15000);
          });
          
          // Start loading
          audio.load();
          await loadPromise;
          
          // Store in cache
          entry.audio = audio;
          entry.loaded = true;
          entry.loading = false;
          entry.error = false;
          
          return true;
        } catch (error) {
          console.warn(`HTML Audio fallback failed for ${url}:`, error);
          entry.loading = false;
          entry.error = true;
          return false;
        }
      }
      
      // Fetch the audio file with credentials
      const response = await fetch(url, { 
        credentials: 'same-origin',
        headers: {
          'Accept': 'audio/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Get the array buffer from the response
      const arrayBuffer = await response.arrayBuffer();
      
      // Make sure we have AudioContext before decoding
      if (!audioContext) {
        if (!initializeAudioContext()) throw new Error("Failed to initialize AudioContext");
      }
      
      // Decode the audio data in the background
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Store the decoded buffer in cache
      entry.buffer = audioBuffer;
      entry.loaded = true;
      entry.loading = false;
      logDebug(`Successfully loaded audio: ${url}`);
      
      // Also set up the HTML audio element as a fallback
      entry.audio.src = url;
      
      return true;
    } catch (error) {
      console.error(`Error loading audio ${url}:`, error);
      
      const entry = audioCache[url];
      if (entry) {
        entry.error = true;
        entry.loading = false;
        
        // Set up for retry if needed
        if (entry.retries < (options?.maxRetries || 2)) {
          entry.retries++;
          // Retry loading after a short delay with exponential backoff
          const delay = 1000 * Math.pow(2, entry.retries - 1);
          logDebug(`Retrying audio load for ${url} in ${delay}ms (attempt ${entry.retries})`);
          return new Promise(resolve => {
            setTimeout(async () => {
              const success = await loadAudioFileInternal(url, priority);
              resolve(success);
            }, delay);
          });
        } else {
          // After max retries, try HTML Audio API as a fallback
          try {
            logDebug(`Trying final HTML Audio fallback for ${url}`);
            const audio = new Audio();
            audio.crossOrigin = "anonymous";
            audio.src = url;
            
            // Listen for the canplaythrough event to know when it's loaded
            audio.addEventListener('canplaythrough', () => {
              if (entry) {
                entry.audio = audio;
                entry.loaded = true;
                entry.loading = false;
                entry.error = false;
                logDebug(`Fallback HTML Audio loaded for ${url}`);
              }
            });
            
            // Handle load errors
            audio.addEventListener('error', (e) => {
              console.error(`HTML Audio fallback error for ${url}:`, e);
            });
            
            // Start loading
            audio.load();
          } catch (audioError) {
            console.error(`HTML Audio fallback failed for ${url}:`, audioError);
          }
        }
      }
      
      return false;
    }
  }, [initAudioEntry, initializeAudioContext, options?.maxRetries, logDebug]);

  /**
   * Queue a single audio file load
   */
  const loadAudioFile = useCallback(async (url: string, priority = false): Promise<boolean> => {
    if (!url) return false;
    
    // If already loaded, return immediately
    if (audioCache[url]?.loaded) return true;
    
    // If already loading with equal or higher priority, skip
    if (audioCache[url]?.loading && !priority) return false;
    
    // Queue the load and return a promise
    return new Promise<boolean>(resolve => {
      if (priority) {
        // Add to front of queue for high priority items
        queuedLoadsRef.current.unshift({url, priority, resolve});
      } else {
        // Add to end of queue for normal priority
        queuedLoadsRef.current.push({url, priority, resolve});
      }
      
      // Process queue on next tick to batch loads
      setTimeout(() => processQueue(), 0);
    });
  }, [processQueue]);

  /**
   * Preload a batch of audio files with prioritization
   */
  const preloadAudioBatch = useCallback(async (urls: string[], highPriority = false) => {
    if (!urls?.length) return;
    
    try {
      setIsLoading(true);
      options?.onLoadStart?.();
      
      // Filter out already loaded URLs if not forcing reload
      const urlsToLoad = urls.filter(url => !audioCache[url]?.loaded);
      
      logDebug(`Preloading batch: ${urlsToLoad.length} files`, { highPriority });
      
      if (urlsToLoad.length === 0) {
        setIsLoading(false);
        options?.onLoadComplete?.();
        return;
      }
      
      // Initialize all entries
      urlsToLoad.forEach(initAudioEntry);
      
      let completedCount = 0;
      
      // Load all files with prioritization - process in smaller batches
      const batchSize = Math.min(5, urlsToLoad.length); // Start with just visible items
      const initialBatch = urlsToLoad.slice(0, batchSize);
      
      logDebug(`Starting initial batch of ${initialBatch.length} files`);
      
      // Start with initial batch
      const initialPromises = initialBatch.map(async (url) => {
        const success = await loadAudioFile(url, highPriority);
        
        // Update progress
        completedCount++;
        setProgress(Math.floor((completedCount / urlsToLoad.length) * 100));
        
        return { url, success };
      });
      
      // Wait for initial batch to complete
      await Promise.allSettled(initialPromises);
      
      // Then load the rest if any
      if (urlsToLoad.length > batchSize) {
        const remainingBatch = urlsToLoad.slice(batchSize);
        
        logDebug(`Loading remaining ${remainingBatch.length} files with lower priority`);
        
        const remainingPromises = remainingBatch.map(async (url) => {
          const success = await loadAudioFile(url, false); // Lower priority for rest
          
          // Update progress
          completedCount++;
          setProgress(Math.floor((completedCount / urlsToLoad.length) * 100));
          
          return { url, success };
        });
        
        // Wait for all to complete
        const results = await Promise.allSettled(remainingPromises);
        
        // Update loaded URLs list
        const newLoadedUrls = results
          .filter((result): result is PromiseFulfilledResult<{url: string, success: boolean}> => 
            result.status === 'fulfilled' && result.value.success)
          .map(result => result.value.url);
        
        setLoadedUrls(prev => {
          const uniqueUrls = new Set([...prev, ...newLoadedUrls]);
          return Array.from(uniqueUrls);
        });
        
        // Check for any errors
        const errors = results.filter(
          result => result.status === 'rejected' || 
          (result.status === 'fulfilled' && !result.value.success)
        );
        
        if (errors.length > 0) {
          logDebug(`Failed to load ${errors.length} of ${urlsToLoad.length} audio files`);
          if (options?.onLoadError) {
            options.onLoadError(errors);
          }
        }
      }
    } catch (error) {
      console.error("Error in batch preloading:", error);
      if (options?.onLoadError) {
        options.onLoadError(error);
      }
    } finally {
      setIsLoading(false);
      setProgress(100);
      options?.onLoadComplete?.();
    }
  }, [loadAudioFile, initAudioEntry, options, logDebug]);

  /**
   * Play an audio file from cache with optimized playback
   */
  const playAudio = useCallback(async (url: string) => {
    if (!url) return;
    
    try {
      logDebug(`Attempting to play: ${url}`);
      
      // Initialize AudioContext if it's the first play
      if (!audioContext) {
        logDebug("Initializing AudioContext for playback");
        if (!initializeAudioContext()) {
          throw new Error("Unable to initialize AudioContext");
        }
      }
      
      // Check if context is suspended and resume it
      if (audioContext && audioContext.state === 'suspended') {
        logDebug("Resuming suspended AudioContext");
        await audioContext.resume();
      }
      
      // Initialize entry if not in cache
      const entry = initAudioEntry(url);
      
      // If not loaded yet, load it immediately with high priority
      if (!entry.loaded && !entry.loading) {
        logDebug("Audio not loaded yet, loading with high priority");
        await loadAudioFile(url, true);
      }
      
      // Play using Web Audio API if we have the buffer and context
      if (audioContext && entry.buffer) {
        logDebug("Playing using Web Audio API");
        // Create a new source node for playback
        const source = audioContext.createBufferSource();
        source.buffer = entry.buffer;
        source.connect(audioContext.destination);
        source.start(0);
        return;
      }
      
      // Fallback to HTML Audio API if Web Audio API failed
      if (entry.audio) {
        logDebug("Playing using HTML Audio API");
        entry.audio.currentTime = 0;
        entry.audio.pause();
        
        try {
          await entry.audio.play();
        } catch (e) {
          console.warn("HTML Audio playback failed, trying once more with user interaction context", e);
          
          // Sometimes the browser requires user interaction before playing
          // This usually happens only once, then subsequent plays work
          const playPromise = entry.audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              // Give up silently after this retry
              console.error("Audio couldn't be played even after retry:", err);
              toast({
                title: "Audio Playback Error",
                description: "Please interact with the page first before playing audio.",
                variant: "destructive"
              });
            });
          }
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      toast({
        title: "Audio Playback Error",
        description: "There was a problem playing the sound. Please try again.",
        variant: "destructive"
      });
    }
  }, [initAudioEntry, loadAudioFile, initializeAudioContext, logDebug]);

  /**
   * Clear specific URLs or all from the cache
   * Using useCallback to prevent recreation on each render
   */
  const clearCache = useCallback((urls?: string[]) => {
    if (!urls) {
      // Clear all cache
      Object.keys(audioCache).forEach(url => {
        if (audioCache[url].audio) {
          audioCache[url].audio.src = '';
        }
        delete audioCache[url];
      });
      setLoadedUrls([]);
      logDebug("Cleared entire audio cache");
    } else {
      // Clear specific URLs
      urls.forEach(url => {
        if (audioCache[url]) {
          if (audioCache[url].audio) {
            audioCache[url].audio.src = '';
          }
          delete audioCache[url];
        }
      });
      setLoadedUrls(prev => prev.filter(url => !urls.includes(url)));
      logDebug(`Cleared ${urls.length} items from audio cache`);
    }
  }, [logDebug]);

  // Clean up on unmount - but don't clear the entire cache
  useEffect(() => {
    return () => {
      // No need to clear the entire cache as other components might be using it
      // Just clean up event listeners
      Object.values(audioCache).forEach(entry => {
        if (entry.audio) {
          entry.audio.pause();
        }
      });
      logDebug("Component unmounting, paused all audio");
    };
  }, [logDebug]);

  // Listen for visibility changes to optimize resource usage
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logDebug("Page hidden, pausing all audio");
        // Pause all audio when tab is inactive
        Object.values(audioCache).forEach(entry => {
          if (entry.audio) {
            entry.audio.pause();
          }
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logDebug]);

  return {
    preloadAudioBatch,
    playAudio,
    clearCache,
    isLoading,
    loadedUrls,
    progress,
    isCached: useCallback((url: string) => !!audioCache[url]?.loaded, []),
    initializeAudioContext // Export this function to let components initialize audio on user gesture
  };
}
