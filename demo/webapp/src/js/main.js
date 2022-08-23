// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

// import Alert from 'bootstrap/js/dist/alert'

// or, specify which plugins you need:
import { Tooltip, Toast, Popover } from 'bootstrap'
const { io } = require("socket.io-client");

$(document).ready(function () {


  // $("#test").click(function () {
  //    $.post("/request",
  //       {
  //          name: "cool stuff",
  //          designation: "cool 2"
  //       },
  //       function (data, status) {
  //          console.log(data);
  //       });
  // });
 });

var socket=io()

// connection with server
socket.on('connect', function(){
  console.log('Connected to Server');
});
 
// message listener from server
socket.on('newMessage', function(message){
 console.log(message);
});
 
// emits message from user side
socket.emit('createMessage', {
  to:'clientside message',
  text:'lol'
});
 
// when disconnected from server
socket.on('disconnect', function(){
  console.log('Disconnect from server')
});