require('dotenv').config()



const Discord = require('discord.js');
const bot = new Discord.Client();

bot.listen(process.env.PORT || 5000);

const token = process.env.token;

bot.login(token);

const prefix = "!";

var isReady = true;

var specialRole = "NootPass"

var markArray = new Array();

//note: noot3 is bass boost and noot8 is glitch noot

bot.on("ready", () => {

    console.log("NootBot is online.");

});

bot.on("message", async msg => {

    let args = msg.content.substring(prefix.length).split(" ");


    //if (isReady) {

    isReady = false;

    switch (args[0]) {

        case "noot":

            console.log("******arg1: " + args[1]);
            //console.log(msg.mentions.members.first());

            if (args[1] == "glitch" && msg.member.roles.cache.some(role => role.name === specialRole)) {

                playAudio(10, msg);

            } else if (args[1] == "loud" && msg.member.roles.cache.some(role => role.name === specialRole)) {

                playAudio(11, msg);

            } else if (args.length > 1 && args[1].startsWith('<@') && args[1].endsWith('>')) {

                //console.log(getUserFromMention(args[1]).id);
                if (args[2] !== undefined) {
                    markUser(getUserFromMention(args[1]).id, args[2]);
                } else {
                    markUser(getUserFromMention(args[1]).id, "random");
                }

                console.log("******markArray length: " + markArray.length);

                for (var i = 0; i < markArray.length; i++) {
                    console.log(markArray[i]);
                }


            } else if (args.length === 1) {

                playAudio(getRandomAudioID(), msg);

            } else {
                msg.reply('Noot?');
            }

    }
    //}


});

// bot.on("disconnect", () => {

//     bot.destroy().then(() => client.login(token));

// });


bot.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.channelID;
    let oldUserChannel = oldMember.channelID;
    //console.log("newUserChannel: " + newUserChannel);
    //console.log("oldUserChannel: " + oldUserChannel);

    if ((oldUserChannel === undefined && newUserChannel !== undefined) || (oldUserChannel === null && newUserChannel !== undefined)) {

        // User Joins a voice channel

        console.log("user joined VC");

        //console.log("new member channel ID " + newUserChannel);

        for (var i = 0; i < markArray.length; i++) {

            if (markArray[i].uID === newMember.id) {

                console.log("markArray[i].command: " + markArray[i].command);

                switch (markArray[i].command) {

                    case "loud": playAudioNoMsg(11, newUserChannel);
                        break;
                    case "glitch": playAudioNoMsg(10, newUserChannel);
                        break;
                    case "random": playAudioNoMsg(getRandomAudioID(), newUserChannel);
                        break;

                }

                markArray.splice(i, 1)
                break;

            }

        }


    } else if (newUserChannel === null) {

        // User leaves a voice channel

        console.log("user left VC");

    }
});


function getRandomAudioID() {

    var index = (Math.floor(Math.random() * 8) + 1);

    console.log("index: " + index);

    return index;
}

async function playAudio(index, msg) {

    if (msg.member.voice.channel) {

        var voiceChannel = msg.member.voice.channel;

        console.log("msg.member.voice.channel; " + msg.member.voice.channel);

        await voiceChannel.join().then(connection => {

            var dispatcher = connection.play("./assets/audio/noot" + index + ".mp3");

            dispatcher.on('finish', () => {
                console.log("Finished playing.")
                //connection.disconnect();
                voiceChannel.leave();
                //dispatcher.pause();
            });

            console.log("Left Channel");

        }).catch(err => console.log(err));

    } else {
        msg.reply('NOOT NOOT!');
    }

    isReady = true;
}

async function playAudioNoMsg(index, channel) {


    let voiceChannel = bot.channels.cache.get(channel);


    await voiceChannel.join().then(connection => {

        var dispatcher = connection.play("./assets/audio/noot" + index + ".mp3");

        dispatcher.on('finish', () => {
            console.log("Finished playing.")
            //connection.disconnect();
            voiceChannel.leave();
            //dispatcher.pause();
        });

        console.log("Left Channel");

    }).catch(err => console.log(err));

}

//from https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#implementation
function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
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
}
