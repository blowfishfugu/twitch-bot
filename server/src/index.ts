import pc from 'picocolors';
import { getSpotifyAccessToken } from './auth/spotify';
import { assertTokenFileExists } from './auth/tokenManager';
import { getTwitchAccessToken } from './auth/twitch';
import { loadBotCommands } from './botCommands';
import { loadChatExclusionList } from './chat/chatExclusionList';
import Config, { assertConfigFileExists } from './config';
import { runBetterTTVWebsocket } from './handlers/bttv/betterTTVWebsocket';
import { fetchSevenTVUser } from './handlers/sevenTV/fetchSevenTVUser';
import { setSevenTVUser } from './handlers/sevenTV/sevenTVUser';
import { runSevenTVWebsocket } from './handlers/sevenTV/sevenTVWebsocket';
import { runTwitchEventSubWebsocket } from './handlers/twitch/event-sub/twitchEventSubWebsocket';
import { fetchCustomRewards } from './handlers/twitch/helix/customRewards';
import { fetchChannelInformation } from './handlers/twitch/helix/fetchChannelInformation';
import { fetchStreamStatus } from './handlers/twitch/helix/fetchStreamStatus';
import { runTwitchIRCWebsocket } from './handlers/twitch/irc/twitchIRCWebsocket';
import { fetchKnownTwitchViewerBots } from './handlers/twitchinsights/twitchViewerBots';
import { intervalCommands, loadIntervalCommands, loadSpotifyIntervalCommands, runIntervalCommands } from './intervalCommands';
import { runSocketServer } from './runSocketServer';
import { setDisplayName, setStreamStatus } from './streamState';

async function main() {
  try {
    assertConfigFileExists();
    assertTokenFileExists();

    loadBotCommands();

    if (Config.features.commands_handler) {
      console.log(`${pc.blue('Startup:')} ${pc.green('[Commands handler enabled]')} Loading bot commands`);
    }

    console.log(`${pc.blue('Startup:')} Getting Twitch access token`);
    await getTwitchAccessToken(Config.twitch);

    if (Config.spotify.enabled) {
      console.log(`${pc.blue('Startup:')} ${pc.green('[Spotify enabled]')} Getting Spotify access token`);
      await getSpotifyAccessToken();

      console.log(`${pc.blue('Startup:')} ${pc.green('[Spotify enabled]')} Loading Spotify bot commands`);

      console.log(`${pc.blue('Startup:')} ${pc.green('[Spotify enabled]')} Loading Spotify interval commands`);
      loadSpotifyIntervalCommands();
    }

    if (Config.github.enabled) {
      console.log(`${pc.blue('Startup:')} ${pc.green('[GitHub enabled]')} Loading GitHub bot commands`);
    }

    loadChatExclusionList();

    console.log(`${pc.blue('Startup:')} Getting Twitch custom rewards`);
    await fetchCustomRewards();

    console.log(`${pc.blue('Startup:')} Getting Twitch viewer bots`);
    await fetchKnownTwitchViewerBots();

    console.log(`${pc.blue('Startup:')} Getting Twitch stream status`);
    setStreamStatus(await fetchStreamStatus());

    console.log(`${pc.blue('Startup:')} Getting Twitch channel information and setting display name`);
    setDisplayName((await fetchChannelInformation())?.broadcaster_name || Config.twitch.account);

    console.log(`${pc.blue('Startup:')} Running Twitch IRC WebSocket client`);
    runTwitchIRCWebsocket();

    if (Config.features.events_handler) {
      console.log(`${pc.blue('Startup:')} ${pc.green('[Events handler enabled]')} Running Twitch Websocket client`);
      runTwitchEventSubWebsocket();
    }

    if (Config.features.interval_commands) {
      console.log(`${pc.blue('Startup:')} ${pc.green('[Interval commands enabled]')} Loading interval commands`);
      loadIntervalCommands();
    }

    if (intervalCommands.length > 0) {
      console.log(
        `${pc.blue('Startup:')} Running interval commands. ${pc.magenta(
          'Note: If interval commands are disabled, but Spotify is enabled, Spotify interval commands will still run.',
        )}`,
      );
      runIntervalCommands();
    }

    console.log(`${pc.blue('Startup:')} Running localhost socket server`);
    runSocketServer();

    if (Config.betterTTV.enabled) {
      console.log(`${pc.blue('Startup:')} ${pc.green('[BetterTTV enabled]')} Running BetterTTV WebSocket client`);
      runBetterTTVWebsocket();
    }

    if (Config.sevenTV.enabled) {
      const sevenTVUser = await fetchSevenTVUser();
      if (sevenTVUser) {
        setSevenTVUser(sevenTVUser);
        runSevenTVWebsocket(sevenTVUser);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

void main();
