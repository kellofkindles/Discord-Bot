require('dotenv').config()
var colors = require('colors'); // Adds colors to the console
const Discord = require('discord.js'); // Discord bot library
const client = new Discord.Client(); // Discord bot

function discordBot() {
    client.login(process.env.LOGIN); // Secret token
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`.yellow);
    });
    const prefix = "!" // Bot's prefix

    var commands = {
        "help": {
            "run": help,
            "description": 'Shows this menu, or just one command',
            "usage": prefix + "help",
            "require": []
        },
        "ping": {
            "run": ping,
            "description": "Pings the bot",
            "usage": prefix + "ping",
            "require": []
        },
        "coin": {
            "run": coin,
            "description": "Flips a coin",
            "usage": prefix + "coin",
            "require": []
        },
        "vote": {
            "run": vote,
            "description": "Create a varity of public or \"private\" polls",
            "Useage": prefix + "vote {abc, yn, y} {10h, 20m, 7d...} {public, private} {Option 1} | {Option 2} | {Option 3}...",
            "require": ["MANAGE_CHANNELS"]
        }
    }

    function help(msg, local) { // Shows commands a user can run or specific command
        var embed = {
            "color": 1,
            "fields": []
        }

        if(local === undefined){
            var rawOptions = msg.content.replace(prefix, "").substring(4);
        } else{
            var rawOptions = comand
        }
        

        if(rawOptions.length <= 1){
            var cmds = Object.keys(commands); // All commands in array form

            for (var i = 0; i < cmds.length; i++) {
                if (msg.member.hasPermission(commands[cmds[i]].require)) { // Only add commands the user can run
                    embed.fields.push({ // Build message to send
                        "name": "**" + prefix + cmds[i] + "**",
                        "value": commands[cmds[i]].description + "\nUsage: `" + commands[cmds[i]].usage + "`",
                        "inline": true
                    })
                }
            }
        } else{
            var cmd = rawOptions.substring(0)
            if (commands[cmd] != undefined && msg.member.hasPermission(commands[cmd].require)) {
                embed.fields.push({ // Build message to send
                    "name": "**" + prefix + cmd + "**",
                    "value": commands[cmd].description + "\nUsage: `" + commands[cmd].usage + "`",
                    "inline": true
                })
            }
        }

        msg.channel.send({
            embed
        }) // Send message

       
    }

    function ping(msg) { // Ping the bot
        msg.channel.send("Pong!")
    }

    function coin(msg) { // Flip a coin
        msg.channel.send((Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails');
    }

    function vote(msg) { // Create a varity of public or "private" polls
        //!vote abc 2h public 1 option | two option | third option

        var rawOptions = msg.content.replace(prefix, "").substring(5);  // Removes "!vote " from the string
        if(rawOptions === "" || rawOptions === " "){
            help(msg, 'vote')
        } else{
            const emoji = {  // Defines possible emoji to be used later
                "abc": ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"], // Letters a-j
                "yn": ["✅", "❌"],
                "y": ["✅"]
            }
    
            var embed = {  // Creates embed to be edited later
                "color": 0,
                "fields": []
            }
    
            var options = {
                "type": undefined,
                "time": undefined,
                "public": undefined,
                "choices": undefined
            }
            
            options.type = rawOptions.split(" ")[0].toLowerCase()  // Defines the type of vote specified
            options.time = rawOptions.split(" ")[1].toLowerCase()  // Defines the time the vote will last
            options.public = rawOptions.split(" ")[2].toLowerCase()  // Defines whether the vote is public or private
            options.choices = rawOptions.substring(rawOptions.split(" ", 3).join(" ").length + 1).split("|")  // Defines all options specified
    
            // Defines error checks for try-catch and time setting
            var letterCheck = options.time.charAt(options.time.length - 1);
            var timeCheck = options.time.substring(0, options.time.length - 1);
            var choicesSort = [...options.choices].sort(function(a, b) {
                return b.length - a.length;
            })
    
    console.log(options)
            try {
    
                switch(letterCheck){
                    case 'm':
                        time = timeCheck * 60000;
                        break;
                    
                    case 'h':
                        time = timeCheck * 3600000;
                        break;
                
                    case 'd':
                        time = timeCheck * 86400000;
                        break;
                
                    default:
                        throw 'Not a valid time type'
                }
    
                if(time > 864000000){
                    throw 'Vote is too long'
                }
    
                for (var i = 0; i < options.choices.length; i++) {
                    embed.fields.push({
                        "name": emoji[options.type][i],
                        "value": options.choices[i] + "\n0 votes",
                        "inline": "true"
                    })
                }
    
                if(embed.fields[embed.fields.length - 1 ].name != undefined){
                    msg.channel.send({ // Sends generated rich embed
                        embed
                    }).then(vote => { 
                        const send = async _ => { // Creates async for loop
                            for (var i = 0; i < options.choices.length; i++) {
                                await vote.react(emoji[options.type][i]) // Reacts with the emoji from the type's array
                            }
                            return vote // Returns the message the bot sent
                        }
                        send().then(vote => {
                          const filter = (reaction, user) => {
                            return user.id != client.user.id && emoji[options.type].slice(0, options.choices.length).includes(reaction.emoji.name);  // Filters out bot reactions and reactions not needed for this vote
                          };
        
                          
                          
                          const collector = vote.createReactionCollector(filter, { time: time });  // Sarts collector
                          
                          var watched = {
                              "id" : msg.id,  // ID of watched message
                              "end" : new Date().getTime() + time,  // Time the collector will end
                              "votes" : {}  // Votes for different reactions by user ids
                            }
                            
                            for(var i = 0; i < options.choices.length;i++){  // Adds all possible emoji choices to watched.votes
                                watched.votes[emoji[options.type][i]] = []
                            }
        
                          collector.on('collect', (reaction, reactionCollector) => {  // When the collector collects something
                              for(const property in watched.votes){
                                watched.votes[property] = watched.votes[property].filter( ( el ) => ![ ...reaction.users.keys() ].includes( el ) );  // Removes all reactions just collected from all votes stored
                              }
                              watched.votes[reaction.emoji.name].push.apply(watched.votes[reaction.emoji.name],[ ...reaction.users.keys() ]);  // Adds the votes for the reaction
                              watched.votes[reaction.emoji.name].splice(watched.votes[reaction.emoji.name].indexOf(client.user.id), 1);  // Removes the bot from votes list
                              reaction.fetchUsers().then(function (reactionUsers) {
                                console.log(reactionUsers.filter(function (_) { return _.id != client.user.id; }));
                                reactionUsers.filter(function (_) { return _.id != client.user.id; }).forEach(reacted => reaction.remove(reacted)); // Remove reactions by users who are not the bot
                            })
                              console.log(watched);
                          });
                          
                          collector.on('end', collected => {
                            console.log(`Collected ${collected.size} items`);
                          });
                          
                        })
                        console.log(time)
                    })
                } else{
                    throw "Embed's last field is undefined"
                }
    
            } catch (err) {
                function missingArgs(){
                    msg.channel.send('**ERROR:** Missing arguments - use `' + prefix + 'help vote` for useage information');
                }
                
                function type(){
                    msg.channel.send('**ERROR:** Unknown vote type - use `abc`, `yn`, or `y`');
                }
                
                function timeSet(){
                    msg.channel.send('**ERROR:** Unknown time type - use either `m` (minute), `h` (hour), or `d` (day)');
                }
                
                function timeLength(){
                    msg.channel.send('**ERROR:** Vote length too long - max time is 10 days');
                }
                
                function public(){
                    msg.channel.send('**ERROR:** Unknown value for public - use either `public` or `private`');
                }
                
                function choices(type){
                    switch (type) {
                        case 'abc':
                            msg.channel.send('**ERROR:** Too many choices - max choices is 10');
                            break;
                    
                        case 'yn':
                            msg.channel.send('**ERROR:** Too many choices - max choices is 2');
                            break;
                
                        case 'y':
                            msg.channel.send('**ERROR:** Too many choices - max choices is 1');
                            break;
                    }
                }
                
                function tooLong(){
                    msg.channel.send('**ERROR:** Option is too long - max length per option is 50 characters')
                }
                
                function unknown(){
                    console.log(err);
                    msg.channel.send('**ERROR:** Unknown error - use `' + prefix + 'help vote` for useage information')
                }
                
                var error;
                
                var letterCheck = options.time.charAt(options.time.length - 1);
                var timeCheck = options.time.substring(0, options.time.length - 1);
                var choicesSort = [...options.choices].sort(function(a, b) {
                    return b.length - a.length;
                })
                switch (true) {
                    case options.choices == ['']:
                        error = missingArgs();
                        break;
                
                    case options.type != 'abc' && options.type != 'yn' && options.type != 'y':
                        error = type();
                        break;
                
                    case Number.isInteger(options.time.charAt(options.time.length - 2)):
                    case letterCheck != "h" && letterCheck != "m" && letterCheck != "d":
                        error = timeSet();
                        break;
                
                    case letterCheck == 'h' && timeCheck > 240:
                        error = timeLength();
                        break;
                
                    case letterCheck == 'm' && timeCheck > 14400:
                        error = timeLength()
                        break;
                
                    case letterCheck == 'd' && timeCheck > 10:
                        error = timeLength();
                        break;
                
                    case options.public != 'public' && options.public != 'private':
                        error = public();
                        break;
                
                    case options.type == 'abc' && options.choices.length > 10:
                        error = choices('abc');
                        break;
                
                    case options.type == 'yn' && options.choices.length > 2:
                        error = choices('yn');
                        break;
                
                    case options.type == 'y' && options.choices.length > 1:
                        error = choices('y');
                        break;
                
                    case choicesSort[0].length > 50:
                        error = tooLong();
                        break;
                
                    default:
                        error = unknown();
                }
            }
        }
        
    }

    client.on("message", function(msg) {
        var cmd = msg.content.replace(prefix, "").split(" ")[0]; // Remove the prefix and options
        if (msg.content.startsWith(prefix) && msg.author != client.user && commands[cmd] && msg.member.hasPermission(commands[cmd].require)) { // Only continue if the message starts with the prefix and the bot didn't make the message and it is a command and the user has permission to run it
            commands[cmd].run(msg); // Run function linked to a command
        }

    })

}

discordBot() // Start the function
module.exports = discordBot; // Export discordBot()