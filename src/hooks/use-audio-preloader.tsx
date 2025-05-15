
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

// Cache to store preloaded audio objects
const audioCache: Record<string, HTMLAudioElement> = {};

export interface AudioPreloaderOptions {
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: (error: any) => void;
}

/**
 * Hook to preload and cache audio files
 */
export function useAudioPreloader(options?: AudioPreloaderOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedUrls, setLoadedUrls] = useState<string[]>([]);

  /**
   * Preload a batch of audio files
   */
  const preloadAudioBatch = async (urls: string[]) => {
    if (!urls.length) return;
    
    try {
      setIsLoading(true);
      options?.onLoadStart?.();
      
      const urlsToLoad = urls.filter(url => !audioCache[url]);
      
      if (urlsToLoad.length === 0) {
        setIsLoading(false);
        options?.onLoadComplete?.();
        return;
      }
      
      // Create and load all audio elements in parallel
      const loadPromises = urlsToLoad.map(url => {
        return new Promise<string>((resolve, reject) => {
          const audio = new Audio();
          
          audio.addEventListener('canplaythrough', () => {
            audioCache[url] = audio;
            resolve(url);
          });
          
          audio.addEventListener('error', (e) => {
            reject({ url, error: e });
          });
          
          audio.src = url;
          audio.load();
        });
      });
      
      // Wait for all to load or fail
      const results = await Promise.allSettled(loadPromises);
      
      // Collect successfully loaded URLs
      const newLoadedUrls = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value);
      
      // Handle any errors
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);
      
      if (errors.length > 0) {
        console.error("Failed to load some audio files:", errors);
        if (options?.onLoadError) {
          options.onLoadError(errors);
        }
      }
      
      setLoadedUrls(prev => [...prev, ...newLoadedUrls]);
    } catch (error) {
      console.error("Error preloading audio:", error);
      if (options?.onLoadError) {
        options.onLoadError(error);
      }
    } finally {
      setIsLoading(false);
      options?.onLoadComplete?.();
    }
  };

  /**
   * Play an audio file from cache or load it if not cached
   */
  const playAudio = async (url: string) => {
    if (!url) return;
    
    try {
      // If already in cache, use it
      if (audioCache[url]) {
        const audio = audioCache[url];
        
        // Reset the audio to the beginning if it was already playing
        audio.pause();
        audio.currentTime = 0;
        
        // Play the audio
        return audio.play();
      }
      
      // Not in cache, need to load it
      setIsLoading(true);
      
      const audio = new Audio(url);
      
      // Create a promise to wait for the audio to load
      const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          resolve(audio);
        });
        
        audio.addEventListener('error', (e) => {
          reject(e);
        });
      });
      
      // Load the audio
      audio.load();
      
      // Wait for it to be ready to play
      const loadedAudio = await loadPromise;
      
      // Store in cache
      audioCache[url] = loadedAudio;
      setLoadedUrls(prev => [...prev, url]);
      
      // Play it
      return loadedAudio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      toast({
        title: "Audio Error",
        description: "There was a problem playing the audio. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear specific URLs from the cache
   */
  const clearCache = (urls?: string[]) => {
    if (!urls) {
      // Clear all cache
      Object.keys(audioCache).forEach(url => {
        audioCache[url].src = '';
        delete audioCache[url];
      });
      setLoadedUrls([]);
    } else {
      // Clear specific URLs
      urls.forEach(url => {
        if (audioCache[url]) {
          audioCache[url].src = '';
          delete audioCache[url];
        }
      });
      setLoadedUrls(prev => prev.filter(url => !urls.includes(url)));
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // No need to clear the entire cache as other components might be using it
      // Just clear any event listeners
      Object.values(audioCache).forEach(audio => {
        audio.pause();
      });
    };
  }, []);

  return {
    preloadAudioBatch,
    playAudio,
    clearCache,
    isLoading,
    loadedUrls,
    isCached: (url: string) => !!audioCache[url]
  };
}
