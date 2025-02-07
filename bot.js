const { Client, Intents } = require('discord.js-selfbot-v13');
const { createAudioPlayer, joinVoiceChannel, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const fs = require('fs');
const yaml = require('js-yaml');
const googleTTS = require('google-tts-api');
const youtubedl = require('youtube-dl-exec');
const lyricsFinder = require('lyrics-finder');

const config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'));

const prefix = config.prefix;
const token = config.token;
const allowedUserIds = config.admin;
let volume = config.volume;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], checkUpdate: false });

let player = createAudioPlayer();
let connections = new Map();

let loopSong = null;
let connection = null;
let currentTrack = null;

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if (!allowedUserIds.includes(message.author.id)) {
    return console.log(`Not Allowed by ${message.author.tag} | ${message} | In ${message.channel.name} (${message.guild.name})`);
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'play') {
    let channelId = message.member.voice.channel ? message.member.voice.channel.id : null;
    let musicName;

    if (channelId) {
      musicName = args.join(' ');
    } else if (args.length >= 2) {
      channelId = args[0];
      musicName = args.slice(1).join(' ');
    }

    if (!channelId) {
      return message.reply('You need to be in a voice channel to play music or provide a channel ID!');
    }
    if (!musicName) {
      return message.channel.send("You need to provide a music name.");
    }

    const musicPath = `./musics/${musicName}.mp3`;

    if (!fs.existsSync(musicPath)) {
      try {
        message.channel.send(`Song Not Found | Downloading **${musicName}** | Will Play it Shortly`);
        await youtubedl(`ytsearch:${musicName}`, {
          extractAudio: true,
          audioFormat: 'mp3',
          output: musicPath,
        });

        console.log(`Downloaded ${musicName}.mp3`);

        connection = joinVoiceChannel({
          channelId: channelId,
          guildId: message.guild.id,
          selfDeaf: false,
          adapterCreator: message.guild.voiceAdapterCreator,
        });

        connections.set(channelId, connection);

        const resource = createAudioResource(musicPath, { inlineVolume: true });
        resource.volume.setVolume(volume);
        player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        player.on('error', error => {
          console.error('Audio player error:', error);
        });

        message.channel.send(`Now Playing: **${musicName}** in <#${channelId}>`);
        currentTrack = musicName;
      } catch (error) {
        console.error('Error downloading the song:', error);
        message.channel.send("An error occurred while trying to download the song.");
      }
    } else {
      connection = joinVoiceChannel({
        channelId: channelId,
        guildId: message.guild.id,
        selfDeaf: false,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      connections.set(channelId, connection);

      const resource = createAudioResource(musicPath, { inlineVolume: true });
      resource.volume.setVolume(volume);
      player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);

      player.on('error', error => {
        console.error('Audio player error:', error);
      });

      message.channel.send(`Now Playing: **${musicName}** in <#${channelId}>`);
      currentTrack = musicName;
    }
  } else if (command === 'tts') {
    let channelId = message.member.voice.channel ? message.member.voice.channel.id : null;
    let text;

    if (channelId) {
      text = args.join(' ');
    } else if (args.length >= 2) {
      channelId = args[0];
      text = args.slice(1).join(' ');
    }

    if (!channelId) {
      return message.reply('You need to be in a voice channel to play TTS or provide a channel ID!');
    }

    if (!text) {
      return message.channel.send("You need to provide a Text to Speech.");
    }

    try {
      const url = googleTTS.getAudioUrl(text, {
        lang: config.TTS.lang,
        slow: config.TTS.slow,
        host: 'https://translate.google.com',
      });

      let connection = connections.get(channelId);
      if (!connection) {
        connection = joinVoiceChannel({
          channelId: channelId,
          guildId: message.guild.id,
          selfDeaf: false,
          adapterCreator: message.guild.voiceAdapterCreator,
        });

        connections.set(channelId, connection);
      }

      const resource = createAudioResource(url, { inlineVolume: true });
      resource.volume.setVolume(volume);
      player.play(resource);
      connection.subscribe(player);

      player.on('error', error => {
        console.error('Audio player error:', error);
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log(`Finished playing TTS message in channel ${channelId}.`);
      });

      console.log(`Playing TTS message in channel ${channelId}.`);
    } catch (error) {
      console.error('Error joining the voice channel:', error);
      message.channel.send("An error occurred while trying to join the voice channel.");
    }
  } else if (command === 'nowplaying') {
    if (currentTrack) {
      message.channel.send(`Now Playing: **${currentTrack}**`);
    } else {
      message.channel.send("No track is currently playing.");
    }
  } else if (command === 'stop') {
    let channelId = message.member.voice.channel ? message.member.voice.channel.id : null;

    if (!channelId && args.length >= 1) {
      channelId = args[0];
    }

    if (!channelId) {
      return message.reply('You need to be in a voice channel to stop the music or provide a channel ID!');
    }

    try {
      const connection = connections.get(channelId);
      if (connection) {
        connection.destroy();
        connections.delete(channelId);
        if (player) {
          player.stop();
        }
        message.channel.send(`Disconnected from <#${channelId}>`);
      } else {
        message.channel.send(`Bot is not connected to channel <#${channelId}>`);
      }
    } catch (error) {
      console.error('Error disconnecting from the voice channel:', error);
      message.channel.send("An error occurred while trying to disconnect from the voice channel.");
    }
  }
 else if (command === 'loop') {
    const musicName = args.slice(0).join(' ');

    if (!musicName) {
      return message.channel.send("You need to provide a music name.");
    }

    loopSong = musicName;
    message.channel.send(`Now Looping: **${musicName}**`);
  } else if (command === 'unloop') {
    loopSong = null;
    message.channel.send(`Successfully Stopped the Current Loop`);
  } else if (command === 'help') {
    message.channel.send(`
**Available Commands:**
-# channelid is only Required if you are not in VC
\`${prefix}play (channelid) (musicname)\` - Play a music file in the specified voice channel.
\`${prefix}stop (channelid)\` - Disconnect from the specified voice channel.
\`${prefix}nowplaying\` - Display the currently playing track.
\`${prefix}loop (musicname)\` - Loop the specified music file.
\`${prefix}unloop\` - Stop looping the current music file.
\`${prefix}tts (channelid) (text)\` - Speaks the Text you Type in Voice Channel.
\`${prefix}volume (level)\` - Set the volume level (0 to 1000).
\`${prefix}lyrics (musicname)\` - Fetch and display lyrics for the specified or currently playing track. (Only Works for songs having lyrics)
\`${prefix}help\` - Display this help message.
    `);
  } else if (command === 'lyrics') {
    const musicName = args.join(' ') || currentTrack;
    if (!musicName) {
      return message.channel.send("You need to specify a track name or be playing a track.");
    }
    lyricsFinder(musicName).then((lyrics) => {
      if (lyrics) {
        message.channel.send(`# **Lyrics for ${musicName}**:\n${lyrics}`);
      } else {
        message.channel.send(`Lyrics not found for **${musicName}**.`);
      }
    }).catch((error) => {
      console.error('Error fetching lyrics:', error);
      message.channel.send("An error occurred while trying to fetch the lyrics.");
    });
  } else if (command === 'volume') {
    const volumeLevel = parseFloat(args[0]);

    if (isNaN(volumeLevel) || volumeLevel < 0 || volumeLevel > 1000) {
      return message.channel.send("You need to provide a valid volume level between 0% and 1000%");
    }

    volume = volumeLevel / 100;
    message.channel.send(`Volume Set to **${volumeLevel}**%.`);

    if (player.state.status === AudioPlayerStatus.Playing && player.state.resource.volume) {
      player.state.resource.volume.setVolume(volume);
    }
  }

  if (player) {
    player.on(AudioPlayerStatus.Idle, () => {
      if (loopSong) {
        const resource = createAudioResource(`./musics/${loopSong}.mp3`, { inlineVolume: true });
        resource.volume.setVolume(volume);
        player.play(resource);
      }
    });
  }
});

client.login(token).catch((err) => {
  console.error(`Error logging in with token "${token}":`, err);
});