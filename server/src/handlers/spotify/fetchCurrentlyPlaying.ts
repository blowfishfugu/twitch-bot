import { fetchWithRetry, getCurrentAccessToken } from '../../auth/spotify';
import Config from '../../config';
import { SPOTIFY_API_URL } from '../../constants';
import { logger } from '../../logger';
import { getIO } from '../../runSocketServer';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import type { SpotifySong } from './types';

let currentSong: SpotifySong | null = null;
let lastSong: SpotifySong | null = null;

export const getCurrentSpotifySong = () => currentSong;

export const getLastSpotifySong = () => lastSong;

export const fetchCurrentlyPlaying = async (): Promise<SpotifySong | null> => {
  if (Config.spotify.enabled) {
    try {
      const url = `${SPOTIFY_API_URL}me/player/currently-playing`;

      const result = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCurrentAccessToken()}`,
        },
      });

      // If the result is an error, return null
      if (!result) {
        logger.info('No result from Spotify, are you sure you have a song playing?');
        return null;
      }

      if (
        hasOwnProperty(result, 'item') &&
        hasOwnProperty(result.item, 'name') &&
        hasOwnProperty(result.item, 'external_urls') &&
        hasOwnProperty(result.item.external_urls, 'spotify') &&
        typeof result.item.name === 'string' &&
        typeof result.item.external_urls.spotify === 'string'
      ) {
        getIO().emit('currentSong', result);
        if (currentSong !== null) {
          lastSong = currentSong;
        }
        currentSong = result as SpotifySong;
      }
    } catch (error) {
      logger.error(error);
    }
  }

  return null;
};
