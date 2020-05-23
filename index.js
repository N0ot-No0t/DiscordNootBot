require('dotenv').config()

const Discord = require('discord.js');
const bot = new Discord.Client();

const token = process.env.token.toString();

bot.login(token);

const prefix = "!";

var isReady = true;

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

            if (msg.member.voice.channel) {

                var voiceChannel = msg.member.voice.channel;

                await voiceChannel.join().then(connection => {

                    var dispatcher = connection.play("./assets/audio/noot" + getRandomAudioID() + ".mp3");

                    //console.log("Playing noot" + getRandomAudioID());

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
    //}


});

// bot.on("disconnect", () => {

//     bot.destroy().then(() => client.login(token));

// });


function getRandomAudioID() {

    var index = (Math.floor(Math.random() * 10) + 1);

    console.log("index: " + index);

    return index;
}