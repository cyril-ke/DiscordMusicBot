require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { Guilds, GuildVoiceStates, GuildMessages, MessageContent } =
  GatewayIntentBits;
const { prefix } = require('./config.json');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [Guilds, GuildVoiceStates, GuildMessages, MessageContent],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const distube = new DisTube(client, {
  searchSongs: 5,
  searchCooldown: 30,
  leaveOnEmpty: false,
  leaveOnFinish: false,
  leaveOnStop: false,
});

client.on('messageCreate', (message) => {
  if (message.author.bot || !message.inGuild()) return;
  //防止機器人回覆到自己的訊息
  if (!message.content.startsWith(prefix)) return;
  //只閱讀含有prefix的訊息，也就是指令。
  //接下來只要把互動的程式填入底下即可
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  //args等於你打進來的句子
  //把prefix分離
  const command = args.shift();
  //把前面的存成command

  if ((command === 'j') | (command === 'join')) {
    const voiceChannel = message.member?.voice?.channel;
    if (voiceChannel) {
      distube.voices.join(message.member.voice.channel);
      message.channel.send(':ok_hand: 安妞哈誰唷');
    } else {
      message.channel.send(':no_entry_sign: 你需要先加入語音頻道');
    }
  }

  if (command === 'p') {
    const voiceChannel = message.member?.voice?.channel; //加入發文者在的語音伺服器
    if (voiceChannel) {
      //判斷是否在語音頻道
      if (args == '') {
        message.channel.send(':no_entry_sign: 請輸入歌曲 ');
      } else {
        distube.play(voiceChannel, args.join(' '), {
          message,
          textChannel: message.channel,
          member: message.member,
        });
      }
      //在所在的voiceChannel，搜尋args裡的歌曲
    } else {
      message.channel.send(':no_entry_sign: 你需要先加入語音頻道');
    }
  }

  if (command === 'l') {
    distube.voices.get(message)?.leave();
    message.channel.send(':wave: 離開語音');
  }

  if (command === 's') distube.skip(message);

  if ((command === 'queue') | (command === 'q')) {
    const queue = distube.getQueue(message);
    if (!queue) {
      message.channel.send('目前歌單沒有歌');
    } else {
      message.channel.send(
        `Current queue:\n${queue.songs
          .map(
            (song, id) =>
              `**${id ? id : 'Playing'}**. ${song.name} - \`${
                song.formattedDuration
              }\``
          ) //將歌的資訊輸出
          .slice(0, 10)
          .join('\n')}` //排列整齊
      );
    }
  }
});

distube.on('addSong', (queue, song) =>
  queue.textChannel?.send(`:heart_hands: 加入歌曲: ${song.name}`)
);

distube.on('playSong', (queue, song) =>
  queue.textChannel?.send(`:pinching_hand: 正在播放: ${song.name}`)
);

distube.on('finish', (queue) =>
  queue.textChannel?.send(':palm_up_hand: 沒歌了！源庭播歌!')
);

client.login(process.env.token);
