require("dotenv").config();

const Discord = require("discord.js");
const bot = new Discord.Client();

const token = process.env.token.toString();

const fs = require("fs");
const readline = require("readline");
const path = "./marks.txt";

bot.login(token);

const prefix = "!";

var isReady = true;

var specialRole = "NootPass";

var markArray = new Array();

//note: noot11 is bass boost and noot10 is glitch noot

bot.on("ready", () => {
  console.log("NootBot is online.");

  fs.access(path, fs.F_OK, err => {
    if (err) {
      //file does not exist
      console.error("File not found.");
    } else {
      //file exists
      console.error("File found.");
      loadMarks();
    }
  });
});

bot.on("message", async msg => {
  let args = msg.content.substring(prefix.length).split(" ");

  //if (isReady) {

  isReady = false;

  switch (args[0]) {
    case "noot":
      console.log("******arg1: " + args[1]);
      //console.log(msg.mentions.members.first());

      if (
        args[1] == "glitch" &&
        msg.member.roles.cache.some(role => role.name === specialRole)
      ) {
        playAudio(10, msg);
      } else if (
        args[1] == "loud" &&
        msg.member.roles.cache.some(role => role.name === specialRole)
      ) {
        playAudio(11, msg);
      } else if (
        args[1] == "nuke" &&
        msg.member.roles.cache.some(role => role.name === specialRole)
      ) {
        //playAudio(12, msg);
        //TODO
      } else if (
        args.length > 1 &&
        ((args[1].startsWith("<@") && args[1].endsWith(">")) ||
          args[1].match(/^\d{2,32}$/))
      ) {
        //console.log(getUserFromMention(args[1]).id);
        if (args[2] !== undefined) {
          if (args[1].match(/^\d{2,32}$/)) {
            markUser(args[1], args[2]);
          } else {
            markUser(getUserFromMention(args[1]).id, args[2]);
          }
        } else {
          if (args[1].match(/^\d{2,32}$/)) {
            markUser(args[1], "random");
          } else {
            markUser(getUserFromMention(args[1]).id, "random");
          }
        }

        console.log("******markArray length: " + markArray.length);

        for (var i = 0; i < markArray.length; i++) {
          console.log(markArray[i]);
        }
      } else if (args.length === 1) {
        playAudio(getRandomAudioID(), msg);
      } else {
        msg.reply("Noot?");
      }
  }
  //}
});

// bot.on("disconnect", () => {

//     bot.destroy().then(() => client.login(token));

// });

bot.on("voiceStateUpdate", (oldMember, newMember) => {
  let newUserChannel = newMember.channelID;
  let oldUserChannel = oldMember.channelID;
  //console.log("newUserChannel: " + newUserChannel);
  //console.log("oldUserChannel: " + oldUserChannel);

  if (
    (oldUserChannel === undefined && newUserChannel !== undefined) ||
    (oldUserChannel === null && newUserChannel !== undefined)
  ) {
    // User Joins a voice channel

    console.log("user joined VC");

    //console.log("new member channel ID " + newUserChannel);

    for (var i = 0; i < markArray.length; i++) {
      if (markArray[i].uID === newMember.id) {
        console.log("markArray[i].command: " + markArray[i].command);

        switch (markArray[i].command) {
          case "loud":
            setTimeout(function() {
              playAudioNoMsg(11, newUserChannel);
            }, 1000);
            break;
          case "glitch":
            setTimeout(function() {
              playAudioNoMsg(10, newUserChannel);
            }, 1000);
            break;

          case "nuke": //playAudioNoMsg(12, newUserChannel);
            //TODO
            break;

          case "random":
            setTimeout(function() {
              playAudioNoMsg(getRandomAudioID(), newUserChannel);
            }, 1000);
            break;
        }

        markArray.splice(i, 1);
        updateFile();
        break;
      }
    }
  } else if (newUserChannel === null) {
    // User leaves a voice channel

    console.log("user left VC");
  }
});

function getRandomAudioID() {
  var index = Math.floor(Math.random() * 8) + 1;

  console.log("index: " + index);

  return index;
}

async function playAudio(index, msg) {
  if (msg.member.voice.channel) {
    var voiceChannel = msg.member.voice.channel;

    console.log("msg.member.voice.channel; " + msg.member.voice.channel);

    await voiceChannel
      .join()
      .then(connection => {
        var dispatcher = connection.play(
          "./assets/audio/noot" + index + ".mp3"
        );

        dispatcher.on("finish", () => {
          console.log("Finished playing.");
          //connection.disconnect();
          voiceChannel.leave();
          //dispatcher.pause();
        });

        console.log("Left Channel");
      })
      .catch(err => console.log(err));
  } else {
    msg.reply("NOOT NOOT!");
  }

  isReady = true;
}

async function playAudioNoMsg(index, channel) {
  let voiceChannel = bot.channels.cache.get(channel);

  await voiceChannel
    .join()
    .then(connection => {
      var dispatcher = connection.play("./assets/audio/noot" + index + ".mp3");

      dispatcher.on("finish", () => {
        console.log("Finished playing.");
        //connection.disconnect();
        voiceChannel.leave();
        //dispatcher.pause();
      });

      console.log("Left Channel");
    })
    .catch(err => console.log(err));
}

//from https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#implementation
function getUserFromMention(mention) {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return bot.users.cache.get(mention);
  }
}

async function markUser(userID, commandArg) {
  var mark = new Object();
  mark.uID = userID;
  mark.command = commandArg;

  markArray.push(mark);

  updateFile();
}

async function updateFile() {
  const writeStream = fs.createWriteStream(path);

  const pathName = writeStream.path;

  //https://stackoverflow.com/questions/17614123/node-js-how-to-write-an-array-to-file/51362713#51362713

  // write each value of the array on the file breaking line
  markArray.forEach(value =>
    writeStream.write(value.uID + "," + value.command + "\n")
  );

  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on("finish", () => {
    console.log(`wrote all the array data to file ${pathName}`);
  });

  // handle the errors on the write process
  writeStream.on("error", err => {
    console.error(`There is an error writing the file ${pathName} => ${err}`);
  });

  // close the stream
  writeStream.end();
}

async function loadMarks() {
  const fileStream = fs.createReadStream(path);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  var nbLines = 0;

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Line from file: ${line}`);

    var lineArray = line.split(",");

    var mark = new Object();
    mark.uID = lineArray[0];
    mark.command = lineArray[1];
    markArray[nbLines] = mark;
    nbLines++;
  }
}
