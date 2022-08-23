
const express = require("express");
const socketIO = require('socket.io');
const path = require("path");
const http = require('http');

const app = express();
const port = process.env.PORT || 80;

// Setting path for public directory 
const static_path = path.join(__dirname, "dist");
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));

  
let server = http.createServer(app);
let io = socketIO(server);

server.listen(port);
console.log(`Listening on port ${port}`);

// connect to C++ app
const tmcc_port = 8080;
// var tmcc = require('net').Socket();
// tmcc.connect(tmcc_port, 'localhost', () => {
//     console.log(`Connected to TMCC on port ${tmcc_port}`);

//     tmcc.write('Hello\n');
// });
tmcc = null;

require('net').createServer(function (socket) {
  console.log("connected");

  tmcc = socket;
  socket.on('data', function (data) {
      console.log(data.toString());
  });

  // socket.write('Hello\n');
  // socket.write('Hello 2\n');
}).listen(tmcc_port);

// make a connection with the user from server side
io.on('connection', (socket)=>{
  console.log('New user connected');

  socket.on('command', (value)=>{
    console.log('received command: ', value);
    tmcc.write(value);
  });

  // when server disconnects from user
  socket.on('disconnect', ()=>{
    console.log('disconnected from user');
  });
});

// // Server Setup
// app.listen(port, () => {
//   console.log(`server is running at ${port}`);
// });
  
