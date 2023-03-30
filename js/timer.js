'use strict'

var gStartTime
var gIntervalId

function startTimer() {
  gStartTime = Date.now();
  gIntervalId = setInterval(updateTimer, 10);
}

function stopTimer() {
  clearInterval(gIntervalId);
  document.querySelector('.timer').textContent =
    formatTime(0) +
    ':' +
    formatTime(0)
}

function updateTimer() {
  var elapsedTime = Date.now() - gStartTime;
  var minutes = Math.floor(elapsedTime / (1000 * 60));
  var seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
  document.querySelector('.timer').textContent =
    formatTime(minutes) +
    ':' +
    formatTime(seconds)
}

function formatTime(time) {
  return (time < 10 ? '0' : '') + time;
}
