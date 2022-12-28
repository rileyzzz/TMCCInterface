const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const http = require("http");
const url = require('url');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 80;

// Setting path for public directory 
const static_path = path.join(__dirname, "graphs/dist");
const res_path = path.join(__dirname, "graphs/res");
// app.use(express.static(static_path));
// app.use(express.static(res_path));
// app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`received request ${req.url}`);

  let reqUrl = url.parse(req.url, true);
  let reqPath = reqUrl.pathname;
  if (reqPath.startsWith("/"))
    reqPath = reqPath.substring(1);
  
  let parts = reqPath.split("/");
  if (parts.length < 2)
    return next();
  
  let channel = parts[0];
  let localpath = parts.slice(1).join("/");
  let file = path.join(static_path, localpath);
  
  console.log(`request channel '${channel}' file '${file}' local '${localpath}'`);

  // We only answer to GET 
  if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
  }

  res.contentType(path.basename(localpath));

  if (localpath === "init.js") {
    console.log("getting init file");
    res.send(`document.twitch_channel = \"${channel}\";`);

    return;
  }

  fs.access(file, fs.constants.F_OK | fs.constants.R_OK, (err) => {
    // why return?
    if(err)
      return next();
    fs.readFile(file, (err, data) => {
      if (err)
        return next();

      // Setup mime type of the file
      // handled above
      // res.setHeader("content-type", "text/html");
      // send the client the modified html
      res.send(data);
    });
  });
});

let server = http.createServer(app);
let io = socketIO(server);

server.listen(port);
console.log(`Listening on port ${port}`);

// make a connection with the user from server side
io.on('connection', (socket)=>{
  console.log('New user connected');

  // socket.on('command', (value)=>{
  //   console.log('received command: ', value);
  //   if (tmcc)
  //     tmcc.write(value);
  // });

  // when server disconnects from user
  socket.on('disconnect', ()=>{
    console.log('Disconnected from user');
  });
});

module.exports = {
  updateGraph: function(channel, data) {
    console.log("emit " + 'graph-update-' + channel.substring(1));
    io.emit('graph-update-' + channel.substring(1), data);
  },
  updateSpeed: function(channel, data) {
    console.log("emit " + 'speed-update-' + channel.substring(1));
    io.emit('speed-update-' + channel.substring(1), { speed: data });
  }
};