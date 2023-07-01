import { readFileSync } from 'fs';
import pc from 'picocolors';
import { hasOwnProperty } from './utils/hasOwnProperty';

export type WebhookConfig = {
  enabled: boolean;
  service: string;
  id: string;
  token: string;
  url: string;
};

export interface TwitchConfig {
  broadcaster_id: string;
  client_id: string;
  client_secret: string;
  grant_type: string;
  account: string;
  channel: string;
  auth_code: string;
  redirect_uri: string;
}

export type MongoDBConfig = {
  enabled: boolean;
  url: string;
  db: string;
};

export type SpotifyConfig = {
  enabled: boolean;
  client_id: string;
  client_secret: string;
  grant_type: string;
  auth_code: string;
  redirect_uri: string;
  country_code: string;
};

export type GitHubConfig = {
  enabled: boolean;
  owner: string;
  repo: string;
  access_token: string;
};

export type SevenTVConfig = {
  enabled: boolean;
  user_id: string;
};

export type BetterTTVConfig = {
  enabled: boolean;
  provider: string;
  provider_id: string;
};

export type FrankerFaceZConfig = {
  enabled: boolean;
  broadcaster_id: string;
};

export type FeaturesConfig = {
  interval_commands: boolean;
  bit_handler: boolean;
  first_message_handler: boolean;
  first_message_of_stream_handler: boolean;
  returning_chatter_handler: boolean;
  commands_handler: boolean;
  events_handler: boolean;
};

interface IConfig {
  twitch: TwitchConfig;
  webhooks: Record<string, WebhookConfig>;
  mongoDB: MongoDBConfig;
  spotify: SpotifyConfig;
  github: GitHubConfig;
  sevenTV: SevenTVConfig;
  betterTTV: BetterTTVConfig;
  frankerFaceZ: FrankerFaceZConfig;
  features: FeaturesConfig;
}

const configFileName = 'config.json';
const missingPropertyErrorMessage = (missingProperty: string) => `${pc.red('Error:')} Missing configuration in ${configFileName}: ${missingProperty}`;

function parseConfig<T>({ config, defaultConfig, part, properties }: { config: unknown; defaultConfig: T; part: string; properties: string[] }): T {
  if (!hasOwnProperty(config, part)) {
    console.error(`Missing in config.json: ${part}`);

    return defaultConfig;
  }

  let loadedConfig: T = { ...defaultConfig };

  const configPart = config[part];

  if (!configPart || typeof configPart !== 'object') {
    console.error(`Invalid ${part} config`);

    return defaultConfig;
  }

  for (const property of properties) {
    if (!hasOwnProperty(configPart, property)) {
      console.error(missingPropertyErrorMessage(`${part}.${property}`));
    } else {
      loadedConfig = { ...loadedConfig, [property]: configPart[property] };
    }
  }

  return loadedConfig;
}

function readTwitchConfig(config: unknown): TwitchConfig {
  const defaultTwitchConfig: TwitchConfig = {
    broadcaster_id: '',
    client_id: '',
    client_secret: '',
    grant_type: '',
    account: '',
    channel: '',
    auth_code: '',
    redirect_uri: '',
  };

  const parsedTwitchConfig = parseConfig<TwitchConfig>({
    config,
    defaultConfig: defaultTwitchConfig,
    part: 'twitch',
    properties: ['broadcaster_id', 'client_id', 'client_secret', 'grant_type', 'account', 'channel', 'auth_code', 'redirect_uri'],
  });

  return parsedTwitchConfig;
}

function readSpotifyConfig(config: unknown): SpotifyConfig {
  const defaultSpotifyConfig: SpotifyConfig = {
    enabled: false,
    client_id: '',
    client_secret: '',
    grant_type: '',
    auth_code: '',
    redirect_uri: '',
    country_code: '',
  };

  const parsedSpotifyConfig = parseConfig<SpotifyConfig>({
    config,
    defaultConfig: defaultSpotifyConfig,
    part: 'spotify',
    properties: ['enabled', 'client_id', 'client_secret', 'grant_type', 'auth_code', 'redirect_uri', 'country_code'],
  });

  return parsedSpotifyConfig;
}

function readGitHubConfig(config: unknown): GitHubConfig {
  const defaultGitHubConfig: GitHubConfig = {
    enabled: false,
    owner: '',
    repo: '',
    access_token: '',
  };

  const parsedGitHubConfig = parseConfig<GitHubConfig>({
    config,
    defaultConfig: defaultGitHubConfig,
    part: 'github',
    properties: ['enabled', 'owner', 'repo', 'access_token'],
  });

  return parsedGitHubConfig;
}

function readSevenTVConfig(config: unknown): SevenTVConfig {
  const defaultSevenTVConfig: SevenTVConfig = {
    enabled: false,
    user_id: '',
  };

  const parsedSevenTVConfig = parseConfig<SevenTVConfig>({
    config,
    defaultConfig: defaultSevenTVConfig,
    part: 'seventv',
    properties: ['enabled', 'user_id'],
  });

  return parsedSevenTVConfig;
}

function readBetterTTVConfig(config: unknown): BetterTTVConfig {
  const defaultBetterTTVConfig: BetterTTVConfig = {
    enabled: false,
    provider: '',
    provider_id: '',
  };

  const parsedBetterTTVConfig = parseConfig<BetterTTVConfig>({
    config,
    defaultConfig: defaultBetterTTVConfig,
    part: 'betterttv',
    properties: ['enabled', 'provider', 'provider_id'],
  });

  return parsedBetterTTVConfig;
}

function readFrankerFaceZConfig(config: unknown): FrankerFaceZConfig {
  const defaultFrankerFaceZConfig: FrankerFaceZConfig = {
    enabled: false,
    broadcaster_id: '',
  };

  const parsedFrankerFaceZConfig = parseConfig<FrankerFaceZConfig>({
    config,
    defaultConfig: defaultFrankerFaceZConfig,
    part: 'frankerfacez',
    properties: ['enabled', 'broadcaster_id'],
  });

  return parsedFrankerFaceZConfig;
}

function readFeaturesConfig(config: unknown): FeaturesConfig {
  const defaultFeaturesConfig: FeaturesConfig = {
    interval_commands: true,
    bit_handler: true,
    first_message_handler: true,
    first_message_of_stream_handler: true,
    returning_chatter_handler: true,
    commands_handler: true,
    events_handler: true,
  };

  const parsedFeaturesConfig = parseConfig<FeaturesConfig>({
    config,
    defaultConfig: defaultFeaturesConfig,
    part: 'features',
    properties: [
      'interval_commands',
      'bit_handler',
      'first_message_handler',
      'first_message_of_stream_handler',
      'returning_chatter_handler',
      'commands_handler',
      'events_handler',
    ],
  });

  return parsedFeaturesConfig;
}

function readMongoDBConfig(config: unknown): MongoDBConfig {
  const defaultMongoDBConfig: MongoDBConfig = {
    enabled: false,
    url: '',
    db: '',
  };

  const parsedMongoDBConfig = parseConfig<MongoDBConfig>({
    config,
    defaultConfig: defaultMongoDBConfig,
    part: 'mongodb',
    properties: ['enabled', 'url', 'db'],
  });

  return parsedMongoDBConfig;
}

function readDiscordWebhookConfig(config: unknown): WebhookConfig {
  const defaultDiscordWebhookConfig: WebhookConfig = {
    enabled: false,
    service: 'discord',
    id: '',
    token: '',
    url: '',
  };

  const parsedDiscordWebhookConfig = parseConfig<WebhookConfig>({
    config,
    defaultConfig: defaultDiscordWebhookConfig,
    part: 'discord_webhook',
    properties: ['enabled', 'service', 'id', 'token', 'url'],
  });

  return parsedDiscordWebhookConfig;
}

const config: unknown = JSON.parse(readFileSync(configFileName, 'utf8'));

const Config: IConfig = {
  twitch: readTwitchConfig(config),
  webhooks: {
    discordChatHook: readDiscordWebhookConfig(config),
  },
  mongoDB: readMongoDBConfig(config),
  spotify: readSpotifyConfig(config),
  github: readGitHubConfig(config),
  sevenTV: readSevenTVConfig(config),
  betterTTV: readBetterTTVConfig(config),
  frankerFaceZ: readFrankerFaceZConfig(config),
  features: readFeaturesConfig(config),
};

export default Config;
