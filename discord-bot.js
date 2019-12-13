require('dotenv').config()
var colors = require('colors'); // Adds colors to the console
const Discord = require('discord.js'); // Discord bot library
const client = new Discord.Client(); // Discord bot
function discordBot(){
client.login(process.env.LOGIN); // Secret token
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`.yellow);
});
const prefix = "!" // Bot's prefix

var commands = {
  "help":{
    "run":help,
    "description":'Shows this menu',
    "usage":prefix + "help",
    "require":[]
  },
  "ping":{
    "run":ping,
    "description":"Pings the bot",
    "usage":prefix + "ping",
    "require":[]
  },
  "coin":{
    "run":coin,
    "description":"Flips a coin",
    "usage":prefix + "coin",
    "require":[]
  }
}

function help(msg){ // Shows commands a user can run
  var cmds = Object.keys(commands); // ALl commands in an array
  var embed = {
    "color": 1,
    "fields": []}

  for(var i=0;i < cmds.length;i++){
    if(msg.member.hasPermission(commands[cmds[i]].require)){ // Only add commands the user can run
      embed.fields.push({  // Build message to send
        "name":"**" + prefix + cmds[i] + "**",
        "value":commands[cmds[i]].description + "\nUsage: `"+ commands[cmds[i]].usage + "`",
        "inline":true
      })
    }
  }
  msg.channel.send({ embed }) // Send message
}

function ping(msg){ // Ping the bot
  msg.channel.send("Pong!")
}

function coin(msg){ // Flip a coin
  msg.channel.send((Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails');
}


client.on("message", function(msg){
var cmd = msg.content.replace(prefix,""); // Remove the prefix
  if(msg.content.startsWith(prefix) && msg.author != client.user && commands[cmd] && msg.member.hasPermission(commands[cmd].require)){ // Only continue if the message starts with the prefix and the bot didn't make the message and it is a command and the user has permission to run it
      commands[cmd].run(msg); // Run function linked to a command
  }

})

}
discordBot() // Start the function
module.exports = discordBot; // Export discordBot()
