'use strict'

var gStartTime
var gIntervalId

function startTimer() {
    gStartTime = Date.now();
    gIntervalId = setInterval(updateTimer, 10);
  }
  
  function stopTimer() {
    clearInterval(gIntervalId);
  }
  
  function updateTimer() {
    var elapsedTime = Date.now() - gStartTime;
    var minutes = Math.floor(elapsedTime / (1000 * 60));
    var seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
    var milliseconds = Math.floor((elapsedTime % 1000) / 10);
    document.getElementById('timer').textContent =
      formatTime(minutes) +
      ':' +
      formatTime(seconds) +
      ':' +
      formatTime(milliseconds);
  }
  
  function formatTime(time) {
    return (time < 10 ? '0' : '') + time;
  }