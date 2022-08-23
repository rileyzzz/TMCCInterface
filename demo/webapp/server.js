
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

// make a connection with the user from server side
io.on('connection', (socket)=>{
    console.log('New user connected');

  socket.emit('newMessage', {
    from:'awesome',
    text:'coolness',
    createdAt:123
  });

  // listen for message from user
  socket.on('createMessage', (newMessage)=>{
    console.log('newMessage', newMessage);
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
  
