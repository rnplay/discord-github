var Discord = require("discord.js");
var http = require('http');
var _ = require('lodash');
var fs = require('fs');

var bot = new Discord.Client();
var config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));

bot.on("ready", function () {
  console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {

  console.log("Disconnected!");
  process.exit(1); //exit node.js with an error

});

bot.on("message", function (msg) {

  if (msg.content.substring(0, 4) === "ping") {

    //send a message to the channel the ping message was sent in.
    bot.sendMessage(msg.channel, "pong!");

    //alert the console
    console.log("pong-ed " + msg.sender.username);

  }
});

function handleRequest(req, response){
  var fullBody = '';

  req.on('data', function(chunk) {
    fullBody += chunk.toString();
  });

  req.on('end', function() {
    var json = JSON.parse(fullBody);
    if (json.commits) {

      repo = _.find(config.repos, function(repo) {
        return json.repository.full_name.includes(repo.prefix);
      });

      if (repo) {
        var channel = _.find(bot.channels, function(channel) {
          return repo.channel == channel.name && repo.server == channel.server.name
        });
      }

      if (channel) {
        msg = `[${json.repository.full_name}] ${json.commits.length} new commits:\n`;
        json.commits.map(function(commit) {
          msg += `${commit.id.substr(0,6)}: ${commit.message} - ${commit.author.name}\n`;
        })
        bot.sendMessage(channel, msg);
      }

    }
  })

  response.end('Done.');
}

var server = http.createServer(handleRequest);

server.listen(80, "0.0.0.0",  function(){
    console.log("Server listening on port 80");
});

bot.login(config.auth.username, config.auth.password);
