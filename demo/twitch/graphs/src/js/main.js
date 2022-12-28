// Import our custom CSS
import '../scss/styles.scss'

// // Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap'

// // import Alert from 'bootstrap/js/dist/alert'

// // or, specify which plugins you need:
// import { Tooltip, Toast, Popover } from 'bootstrap'
const { io } = require("socket.io-client");

var socket = io();
var listen_channel = null;

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
  let total_value = 0;
  for (let i = 0; i < data.votes.length; i++) {
    const elem = data.votes[i];
    // console.log(`e value ${elem.value}`);
    total_value += elem.value;
    if (elem.value > max_value)
      max_value = elem.value;
  }
  // console.log(`max value ${max_value}`);

  for (let i = 0; i < data.votes.length; i++) {
    let bar = graph.children().eq(i).children().first();
    let src = data.votes[i];

    console.log(`bar ${i} height ${(src.value / total_value)}`);

    let percent = (src.value / total_value * 100).toString() + "%";
    bar.css('height', percent);

    bar.children(".graph-bar-percent").first().text(percent);
    bar.children(".graph-bar-label").first().text(src.text);
  }
}

function buildSpeed(speed) {
  let needle = $("#needle");

  let factor = speed / 200.0;
  let angle = -135.0 + factor * 270.0;
  
  needle.css('transform', `rotate(${angle}deg)`);

  $("#speed-label").text(speed.toString().padStart(3, '0'));
}


$(document).ready(function () {
  listen_channel = document.twitch_channel;
  if (!listen_channel) {
    console.error("No channel id provided!");
  }
  // let test = [];
  // test.push({
  //   text: 'Data 1',
  //   value: 5
  // });

  // test.push({
  //   text: 'Data 2',
  //   value: 10
  // });

  // test.push({
  //   text: 'Data 3',
  //   value: 8
  // });

  // buildGraph({
  //   title: 'Title!',
  //   votes: test
  // });

  if ($("#graph").length) {
    console.log("listen for " + 'graph-update-' + listen_channel);
    socket.on('graph-update-' + listen_channel, function (msg) {
      buildGraph(msg);
    });
  }

  if ($("#needle").length) {
    console.log("listen for " + 'speed-update-' + listen_channel);
    socket.on('speed-update-' + listen_channel, function (msg) {
      console.log(`update speed ${msg.speed}`);
      buildSpeed(msg.speed);
    });
  }

  buildSpeed(0);
});
