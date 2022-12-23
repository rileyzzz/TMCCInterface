
const path = require("path");
const http = require('http');
const https = require('https');
const url = require('url');
const tmi = require('tmi.js');
const fs = require('fs');
const open = require('open');

const VoteType = {
  // Throttle: Symbol("throttle"),
  // Horn: Symbol("horn"),
  // Bell: Symbol("bell"),
  // Direction: Symbol("direction"),
  // Juction: Symbol("junction")
  Throttle: "throttle",
  Horn: "horn",
  Bell: "bell",
  Direction: "direction",
  Juction: "junction"
};
var vote_callbacks = {};
var channel_vote_data = {};

const port = process.env.PORT || 80;

const args = process.argv.slice(2).map(s => s.trim("\""));
if (args.length < 1)
  console.error("Error: No engine number specified! Defaulting to 0.");

var client = null;
var channel_engine_ids = [];
var bot_user = "";
var bot_client_id = "";
var bot_client_secret = "";
var bot_channels = [];
var cooldown_time = 5.0;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "-engine" && i + 1 < args.length) {
    channel_engine_ids = args[i + 1].split(",").map(s => parseInt(s.trim()));

    for (let i = 0; i < channel_engine_ids.length; i++) {
      if (isNaN(channel_engine_ids[i]) || channel_engine_ids[i] < 0) {
        console.error(`Invalid engine ID entered: '${channel_engine_ids[i]}'. Defaulting to 0.`);
        channel_engine_ids[i] = 0;
      }
    }
  }
  else if (args[i] === "-user" && i + 1 < args.length) {
    bot_user = args[i + 1];
  }
  else if (args[i] === "-client" && i + 1 < args.length) {
    bot_client_id = args[i + 1];
  }
  else if (args[i] === "-secret" && i + 1 < args.length) {
    bot_client_secret = args[i + 1];
  }
  else if (args[i] === "-channel" && i + 1 < args.length) {
    bot_channels = args[i + 1].split(",").map(s => s.trim());
  }
  else if (args[i] === "-cooldown" && i + 1 < args.length) {
    // cooldown time in seconds
    cooldown_time = parseFloat(args[i + 1]);
  }
}

if (!bot_user)
  console.error("No bot username specified!");

if (!bot_client_id)
  console.error("No bot client ID specified!");
  
if (!bot_client_secret)
  console.error("No bot client secret specified!");

if (bot_channels.length == 0)
  console.error("No bot channels specified!");

if (channel_engine_ids.length == 0)
  console.error("No engine IDs specified!");

const tokenPath = './tokens.json';

var bot_token = null;
var bot_refresh_token = null;
if (fs.existsSync(tokenPath)) {
  let rawdata = fs.readFileSync(tokenPath);
  let json = JSON.parse(rawdata);

  bot_token = json.token;
  bot_refresh_token = json.refresh_token;

  tryStartClient();
}
else {
  // first time auth
  let http = require('http');
  let server = http.createServer();
  server.listen(3000);

  var auth_code = null;
  server.on('request', (req, res) => {
    // console.log(`received 3000 request ${req.url}`);
    if (auth_code)
      return;
    
    const queryObject = url.parse(req.url, true).query;
    if (queryObject.code) {
      auth_code = queryObject.code;
      console.log(`Received auth code '${auth_code}'`);
    }
    else {
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Please close this window");
    // server.close();

    
    var post_data = `client_id=${bot_client_id}&client_secret=${bot_client_secret}&code=${auth_code}&grant_type=authorization_code&redirect_uri=http://localhost:3000`;
    console.log(`POST: ${post_data}`);
    var post_options = {
      host: 'id.twitch.tv',
      port: 443,
      path: '/oauth2/token',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
      }
    };

    var post_req = https.request(post_options, function(res) {
      res.setEncoding('utf8');

      let allData = '';
      res.on('data', chunk => {
          allData += chunk;
      });

      res.on('end', () => {
        let resolved_data = JSON.parse(allData);
        bot_token = resolved_data.access_token;
        bot_refresh_token = resolved_data.refresh_token;

        let json = JSON.stringify({
          token: bot_token,
          refresh_token: bot_refresh_token
        });
        fs.writeFileSync(tokenPath, json);

        tryStartClient();
      });
    });

    post_req.on('error', (e) => {
      console.error(e);
    });

    post_req.on('timeout', () => {
      post_req.destroy();
      console.error("Request timed out!");
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

    // startClient();
  });
  
  open(`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${bot_client_id}&redirect_uri=http://localhost:3000&scope=chat%3Aread+chat%3Aedit`);

}


// connect to C++ app
const tmcc_port = 8080;
tmcc = null;

// require('net').createServer(function (socket) {
//   console.log("connected");

//   tmcc = socket;
//   socket.on('data', function (data) {
//       console.log(data.toString());
//   });

//   // socket.write('Hello\n');
//   // socket.write('Hello 2\n');
// }).listen(tmcc_port);

// process.on('uncaughtException', function (err) {
//   console.error(err.stack);
// });

function tryStartClient() {
  if (!bot_token || !bot_refresh_token) {
    console.error("Invalid token or refresh token!");
    return;
  }

  const opts = {
    identity: {
      username: bot_user,
      password: bot_token
    },
    channels: bot_channels
  };

  // Create a client with our options
  // try {
  client = new tmi.client(opts);
  // }
  // catch (error) {
  //   if (error) {
  //     console.log("Token has expired - refreshing.");
  //     // we need a new token
  //     var post_data = `client_id=${bot_client_id}&client_secret=${bot_client_secret}&code=${auth_code}&grant_type=refresh_token&refresh_token=${bot_refresh_token}`;
  //     console.log(`POST: ${post_data}`);
  //     var post_options = {
  //       host: 'id.twitch.tv',
  //       port: 443,
  //       path: '/oauth2/token',
  //       method: 'POST',
  //       headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //           'Content-Length': post_data.length
  //       }
  //     };
  
  //     var post_req = https.request(post_options, function(res) {
  //       res.setEncoding('utf8');
  
  //       let allData = '';
  //       res.on('data', chunk => {
  //           allData += chunk;
  //       });
  
  //       res.on('end', () => {
  //         let resolved_data = JSON.parse(allData);
  //         bot_token = resolved_data.access_token;
  //         bot_refresh_token = resolved_data.refresh_token;
  
  //         // resave the data
  //         if (bot_token && bot_refresh_token) {
  //           console.log("Updated token file.");
  //           let json = JSON.stringify({
  //             token: bot_token,
  //             refresh_token: bot_refresh_token
  //           });
  //           fs.writeFile(tokenPath, json, 'utf8');
  //         }
  //       });
  //     });
  
  //     post_req.on('error', (e) => {
  //       console.error(e);
  //     });
  
  //     post_req.on('timeout', () => {
  //       post_req.destroy();
  //       console.error("Request timed out!");
  //     });
  
  //     // post the data
  //     post_req.write(post_data);
  //     post_req.end();
  //   }
  // }
  // Register our event handlers (defined below)
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);

  // Connect to Twitch:
  client.connect();

  // once connected, begin processing votes
  setInterval(function() {
    bot_channels.forEach(c => processVotes(c));
  }, cooldown_time * 1000);
}

var last_command_time = 0;

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  
  // Remove whitespace from chat message
  const commandName = msg.trim();

  if (commandName === "!help") {
    // always give help immediately, don't trigger the cooldown
    client.say(target, `Commands:
      '!throttle [0-200]' - Set the locomotive's speed.
      '!horn' - Honk the horn!
      '!bell' - Toggle the locomotive's bell.
      '!direction [forward/backward]' - Should the train move forward or backwards?
      '!junction [junction_id]' - Switch the direction of a junction on the layout.
    `);
    return;
  }

  // const time = Date.now() / 1000.0;

  // command cooldown of 5 seconds
  // if (time - last_command_time < cooldown_time)
  //   return;

  // only set the command time if we actually run a command
  // last_command_time = time;

  // If the command is known, let's execute it
  if (processCommand(client, target, commandName)) {
    // client.say(target, `You rolled a ${num}`);
    // last_command_time = time;
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function processCommand(client, target, command) {
  let args = command.split(" ");
  if (args.length == 0)
    return false;
  
  if (args[0] === "!throttle" && args.length > 1) {
    let throttleValue = parseInt(args[1]);
    if (!isNaN(throttleValue) && throttleValue >= 0 && throttleValue <= 200) {
      addVote(target, VoteType.Throttle, throttleValue);
    }
  }
  else if (args[0] === "!horn") {
    addVote(target, VoteType.Horn);
    return true;
  }
  else if (args[0] === "!bell") {
    addVote(target, VoteType.Bell);
    return true;
  }
  else if (args[0] === "!direction" && args.length > 1) {
    if (args[1] === "forward" || args[1] === "backward") {
      addVote(target, VoteType.Direction, args[1]);
      return true;
    }
  }
  else if (args[0] === "!junction" && args.length > 1) {
    let junctionId = parseInt(args[1]);

    if (!isNaN(junctionId) && junctionId >= 0) {
      addVote(target, VoteType.Junction, junctionId);
      return true;
    }
  }
  return false;
}

// thanks stack overflow, this is pretty concise!
// basically just counts up how many of each element there are,
// then loops through again to find which one had the most occurences.
function mode(a) {
  return Object.values(
    a.reduce((count, e) => {
      if (!(e in count)) {
        count[e] = [0, e];
      }
      
      count[e][0]++;
      return count;
    }, {})
  ).reduce((a, v) => v[0] < a[0] ? a : v, [0, null])[1];
}

declareVoteType(VoteType.Throttle,
  // Vote data
  function() {
    return { values: [] };
  },
  // Process a vote
  function(channel, data, args) {
    data.values.push(args[0]);
  },
  // Category has won
  function(channel, data) {
    // let choice = mode(data.values);
    let avg = data.values.reduce((a, b) => a + b) / data.values.length;

    client.say(channel, `Setting the throttle to ${avg}!`);
  }
);

declareVoteType(VoteType.Horn,
  // Vote data
  function() {
    return null;
  },
  // Process a vote
  function(channel, data, args) {
  },
  // Category has won
  function(channel, data) {
    client.say(channel, "Honking the horn!");
  }
);

declareVoteType(VoteType.Bell,
  // Vote data
  function() {
    return null;
  },
  // Process a vote
  function(channel, data, args) {
  },
  // Category has won
  function(channel, data) {
    client.say(channel, "Ringing the bell!");
  }
);

declareVoteType(VoteType.Direction,
  // Vote data
  function() {
    return { values: [] };
  },
  // Process a vote
  function(channel, data, args) {
    data.values.push(args[0]);
  },
  // Category has won
  function(channel, data) {
    let choice = mode(data.values);

    client.say(channel, `Setting the direction to ${choice}!`);
  }
);

declareVoteType(VoteType.Junction,
  // Vote data
  function() {
    return { values: [] };
  },
  // Process a vote
  function(channel, data, args) {
    data.values.push(args[0]);
  },
  // Category has won
  function(channel, data) {
    let choice = mode(data.values);

    client.say(channel, `Toggling junction ${choice}!`);
  }
);

// voting internal functions. declare all vote implementations above this
function declareVoteType(type, getDefaultValue, processCallback, winCallback) {
  vote_callbacks[type] = {
    default: getDefaultValue,
    process: processCallback,
    win: winCallback
  };
}

function addVote(channel, type, ...args) {
  if (!(type in vote_callbacks)) {
    console.error(`Unknown vote type '${type}'!`);
    return;
  }

  let data = channel_vote_data[channel];

  vote_callbacks[type].process(channel, data.vote_data[type], args);
  data.vote_counts[type]++;
}

function resetVotes() {
  bot_channels.forEach(function(c) {
    let vote_data = {};
    let vote_counts = {};
    for (const [key, value] of Object.entries(vote_callbacks)) {
      vote_data[key] = value.default();
      vote_counts[key] = 0;
    }

    channel_vote_data[c] = {
      vote_data: vote_data,
      vote_counts: vote_counts
    };
  });
}

function processVotes(channel) {
  let data = channel_vote_data[channel];
  if (!data) {
    resetVotes();
    return;
  }

  // find which category has the most votes
  let highest = 0;
  let highest_type = null;
  for (const [key, value] of Object.entries(vote_callbacks)) {
    if (data.vote_counts[key] > highest) {
      highest = data.vote_counts[key];
      highest_type = key;
    }
  }

  if (highest == 0) {
    client.say(channel, "Debug: No votes recorded!");

    resetVotes();
    return;
  }

  vote_callbacks[highest_type].win(channel, data.vote_data[highest_type]);
  
  resetVotes();
}
