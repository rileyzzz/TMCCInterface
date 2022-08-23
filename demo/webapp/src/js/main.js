// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

// import Alert from 'bootstrap/js/dist/alert'

// or, specify which plugins you need:
import { Tooltip, Toast, Popover } from 'bootstrap'
const { io } = require("socket.io-client");



var socket=io()

// connection with server
socket.on('connect', function(){
  console.log('Connected to Server');
});
 
// message listener from server
socket.on('newMessage', function(message){
 console.log(message);
});
 

 
// when disconnected from server
socket.on('disconnect', function(){
  console.log('Disconnect from server')
});

$(document).ready(function () {

  $("#throttle").on('input change', function () {
    let cmd = "setThrottle " + ($(this).val() / 200.0).toString() + "\r\n";
    socket.emit('command', cmd);
  });

  $("#brake").on('input change', function () {
    let cmd = "setBrake " + ($(this).val() / 8.0).toString() + "\r\n";
    socket.emit('command', cmd);
  });

  $("#legacy").change(function () {
    let cmd = "setLegacy " + (this.checked ? 1 : 0).toString() + "\r\n";
    socket.emit('command', cmd);
  });
});