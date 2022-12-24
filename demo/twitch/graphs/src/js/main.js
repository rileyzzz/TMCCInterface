// Import our custom CSS
import '../scss/styles.scss'

// // Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap'

// // import Alert from 'bootstrap/js/dist/alert'

// // or, specify which plugins you need:
// import { Tooltip, Toast, Popover } from 'bootstrap'
// const { io } = require("socket.io-client");

function buildGraph(data) {
  let graph = $("#graph");

  $(".graph-header").text(data.title);

  while (graph.children().length > data.votes.length) {
    graph.children().last().remove();
  }

  while (graph.children().length < data.votes.length) {
    graph.append("<div class='graph-bar-container'><div class='graph-bar'><div class='graph-bar-percent'></div><div class='graph-bar-label'></div></div></div>");
  }

  let max_value = 0;
  for (let i = 0; i < data.votes.length; i++) {
    const elem = data.votes[i];
    // console.log(`e value ${elem.value}`);
    if (elem.value > max_value)
      max_value = elem.value;
  }
  // console.log(`max value ${max_value}`);

  for (let i = 0; i < data.votes.length; i++) {
    let bar = graph.children().eq(i).children().first();
    let src = data.votes[i];

    console.log(`bar ${i} height ${(src.value / max_value)}`);

    let percent = (src.value / max_value * 100).toString() + "%";
    bar.css('height', percent);

    bar.children(".graph-bar-percent").first().text(percent);
    bar.children(".graph-bar-label").first().text(src.text);
  }
}


$(document).ready(function () {
  let test = [];
  test.push({
    text: 'Data 1',
    value: 5
  });

  test.push({
    text: 'Data 2',
    value: 10
  });

  test.push({
    text: 'Data 3',
    value: 8
  });

  buildGraph({
    title: 'Title!',
    votes: test
  });
});

// var socket=io()
// var engine = 0;

// // connection with server
// socket.on('connect', function(){
//   console.log('Connected to Server');
// });
 
// // message listener from server
// socket.on('newMessage', function(message){
//  console.log(message);
// });
 

 
// // when disconnected from server
// socket.on('disconnect', function(){
//   console.log('Disconnect from server')
// });

// // prevent zooming on ios
// document.addEventListener('gesturestart', function (e) {
//   e.preventDefault();
// });

// document.addEventListener('touchmove', function (event) {
//   if (event.scale !== 1) { event.preventDefault(); }
// }, false);

// var lastTouchEnd = 0;
// document.addEventListener('touchend', function (event) {
//   var now = (new Date()).getTime();
//   if (now - lastTouchEnd <= 300) {
//     event.preventDefault();
//   }
//   lastTouchEnd = now;
// }, false);

// let numericInput = true;
// let numericBuf = "";

// function updateNumeric(value) {
//   numericBuf += value;
//   console.log('updated numeric to ' + numericBuf);
//   $("#kp-buffer").text(numericBuf);
// }

// function clearNumeric() {
//   numericBuf = "";
//   $("#kp-buffer").text(numericBuf);
// }

// $(document).ready(function () {

//   $("#throttle").on('input change', function () {
//     let cmd = "setThrottle " + engine.toString() + " " + ($(this).val() / 200.0).toString() + "\r\n";
//     socket.emit('command', cmd);
//   });

//   $("#brake").on('input change', function () {
//     let cmd = "setBrake " + engine.toString() + " " + ($(this).val() / 8.0).toString() + "\r\n";
//     socket.emit('command', cmd);
//   });

//   $("#legacy").change(function () {
//     let cmd = "setLegacy " + (this.checked ? 1 : 0).toString() + "\r\n";
//     socket.emit('command', cmd);
//   });

//   $("#kp-numeric").addClass("active-mode");
//   $("#kp-engine").click(function (e) {
//     numericInput = false;
//     $("#kp-engine").addClass("active-mode");
//     $("#kp-numeric").removeClass("active-mode");
//   });

//   $("#kp-numeric").click(function (e) {
//     numericInput = true;
//     $("#kp-numeric").addClass("active-mode");
//     $("#kp-engine").removeClass("active-mode");
//   });

//   $("#kp-clear").click(function (e) {
//     clearNumeric();
//   });

//   $("#kp-go").click(function (e) {
//     if (numericBuf.length == 0)
//       return;
    
//     if (numericInput) {
//       let cmd = "numericCommand " + engine.toString() + " " + numericBuf + "\r\n";
//       socket.emit('command', cmd);
//     }
//     else {
//       // let cmd = "setEngine " + numericBuf + "\r\n";
//       // socket.emit('command', cmd);
// 	  engine = numericBuf;
//     }
//   });

//   for (let i = 0; i <= 9; i++) {
//     $("#kp-" + i.toString()).click(function (e) {
//       updateNumeric(i.toString());
//     });
//   }
// });