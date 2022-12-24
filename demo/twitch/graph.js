const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const http = require("http");

const app = express();
const port = process.env.PORT || 80;

// Setting path for public directory 
const static_path = path.join(__dirname, "graphs/dist");
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));
  
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
  updateGraph: function(data) {
    io.emit('graph-update', data);
  }
};