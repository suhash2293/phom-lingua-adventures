
import { useState, useEffect, useCallback } from 'react';
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
}

/**
 * Hook to preload and cache audio files using Web Audio API for better performance
 */
export function useAudioPreloader(options?: AudioPreloaderOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUrls, setLoadedUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  
  // Initialize AudioContext on first use
  useEffect(() => {
    if (!audioContext) {
      try {
        // Create AudioContext only on user interaction if possible
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error("Failed to create AudioContext:", error);
        toast({
          title: "Audio Playback Issue",
          description: "Your browser may have limited audio support. Some sounds might not play correctly.",
          variant: "destructive"
        });
      }
    }
    
    return () => {
      // Don't close the audioContext on component unmount as it might be used by other components
    };
  }, []);

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
   * Load a single audio file into cache
   */
  const loadAudioFile = useCallback(async (url: string, priority = false): Promise<boolean> => {
    if (!url || !audioContext) return false;
    
    try {
      let entry = initAudioEntry(url);
      
      // If already loaded or loading without priority, skip
      if (entry.loaded) return true;
      if (entry.loading && !priority) return false;
      
      // Mark as loading
      entry.loading = true;
      
      // Fetch the audio file with credentials
      const response = await fetch(url, { 
        credentials: 'same-origin',
        headers: {
          'Accept': 'audio/*'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      // Get the array buffer from the response
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode the audio data in the background
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Store the decoded buffer in cache
      entry.buffer = audioBuffer;
      entry.loaded = true;
      entry.loading = false;
      
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
          console.log(`Retrying audio load for ${url} in ${delay}ms (attempt ${entry.retries})`);
          setTimeout(() => loadAudioFile(url, priority), delay);
        } else {
          // After max retries, try HTML Audio API as a fallback
          try {
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
                console.log(`Fallback HTML Audio loaded for ${url}`);
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
  }, [initAudioEntry]);

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
      
      if (urlsToLoad.length === 0) {
        setIsLoading(false);
        options?.onLoadComplete?.();
        return;
      }
      
      // Initialize all entries
      urlsToLoad.forEach(initAudioEntry);
      
      let completedCount = 0;
      
      // Load all files with prioritization
      const loadPromises = urlsToLoad.map(async (url) => {
        const success = await loadAudioFile(url, highPriority);
        
        // Update progress
        completedCount++;
        setProgress(Math.floor((completedCount / urlsToLoad.length) * 100));
        
        return { url, success };
      });
      
      // Wait for all to complete
      const results = await Promise.allSettled(loadPromises);
      
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
        console.warn(`Failed to load ${errors.length} of ${urlsToLoad.length} audio files`);
        if (options?.onLoadError) {
          options.onLoadError(errors);
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
  }, [loadAudioFile, initAudioEntry, options]);

  /**
   * Play an audio file from cache with optimized playback
   */
  const playAudio = useCallback(async (url: string) => {
    if (!url) return;
    
    try {
      // Initialize entry if not in cache
      const entry = initAudioEntry(url);
      
      // If not loaded yet, load it immediately with high priority
      if (!entry.loaded && !entry.loading) {
        await loadAudioFile(url, true);
      }
      
      // Play using Web Audio API if we have the buffer and context
      if (audioContext && entry.buffer) {
        // Check if context is suspended and resume it
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // Create a new source node for playback
        const source = audioContext.createBufferSource();
        source.buffer = entry.buffer;
        source.connect(audioContext.destination);
        source.start(0);
        return;
      }
      
      // Fallback to HTML Audio API if Web Audio API failed
      if (entry.audio) {
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
                description: "Browser prevented audio playback. Try clicking elsewhere on the page first.",
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
  }, [initAudioEntry, loadAudioFile]);

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
    }
  }, []);

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
    };
  }, []);

  return {
    preloadAudioBatch,
    playAudio,
    clearCache,
    isLoading,
    loadedUrls,
    progress,
    isCached: useCallback((url: string) => !!audioCache[url]?.loaded, [])
  };
}
