import { SECOND_MS } from '../constants';
import { getStreamStartedAt, getStreamStatus } from '../streamState';
import type { BotCommand } from '../types';
import { timeBetweenDates } from '../utils/timeBetweenDates';
import { sendChatMessage } from './helpers/sendChatMessage';

export const uptime: BotCommand = {
  command: ['uptime', 'up', 'uppies'],
  id: 'uptime',
  cooldown: 5 * SECOND_MS,
  callback: (connection) => {
    if (getStreamStatus() === 'online') {
      const timeString = timeBetweenDates(new Date(getStreamStartedAt()), new Date());
      sendChatMessage(connection, `The stream has been live for ${timeString}`);
    } else {
      sendChatMessage(connection, `The stream is offline`);
    }
  },
};
