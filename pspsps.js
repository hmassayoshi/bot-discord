const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");
const yts = require( 'yt-search');
const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
  return;
} else if (message.content.startsWith(`${prefix}pau`)) {
  for (var i = 0; i < 12; i++) {
  message.channel.send("<@200081872930209793> pspsps ÃHÃ");
  }
} else if (message.content.startsWith(`${prefix}gaud`)) {
  for (var i = 0; i < 12; i++) {
  message.channel.send("<@203626439747174401> pspsps misericórdia");
  }
} else if (message.content.startsWith(`${prefix}fred`)) {
  for (var i = 0; i < 12; i++) {
  message.channel.send("<@200083419298922496> pspsps kabum leva meu monitor");
  }
} else if (message.content.startsWith(`${prefix}alon`)) {
  for (var i = 0; i < 12; i++) {

  message.channel.send("<@202605269295824897> pspsps IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIAAAAAAAA");

  }
} else if (message.content.startsWith(`${prefix}king`)) {
  for (var i = 0; i < 12; i++) {
  message.channel.send("<@415587440489922580> pspsps eu to TENTANDO");
  }
} else if (message.content.startsWith(`${prefix}help`)) {
 
  message.channel.send("***Olá pspspsers*** \n **>Comandos .pspsps:**\n .help\n **Música:** .play urlYT .stop .skip \n **Chamando os gatinhos:** .nick .gaud .pau .fred .alon .king");

  } else if (message.content.startsWith(`${prefix}nick`)) {
		for (var i = 0; i < 12; i++) {
    message.channel.send("<@283792149584019456> pspsps kibisurdo");
		}
	return;	
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function execute(message, serverQueue) {
  let args = message.content.replace(`${prefix}play `,'');

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }
  let song
  if (args.startsWith('https')){
  const songInfo = await ytdl.getInfo(args);
   song = {
    title: songInfo.title,
    url: songInfo.video_url
  };
  }
  else{
    const {videos} = await yts(args);
  if (!videos.length) return message.channel.send("No songs were found!");
  song = {
    title: videos[0].title,
    url: videos[0].url
  };
  }
  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: *${song.title}*`);
}

client.login(token);