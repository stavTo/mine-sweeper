'use strict'

var gStartTime
var gIntervalId

function getClassName(location) {
  const cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

// function renderCell(i, j) {
//   const elCell = document.querySelector(`.cell-${i}-${j}`)
//   elCell.classList.add('shown')
//   if (gBoard[i][j].isMine && isHint) {
//     elCell.innerHTML = MINE_IMG
//   }
//   if (gBoard[i][j].minesAroundCount === 0 || gBoard[i][j].isMarked) return
//   elCell.innerHTML = gBoard[i][j].minesAroundCount
// }

function deleteRenderCell(i, j) {
  const elCell = document.querySelector(`.cell-${i}-${j}`)
  elCell.classList.remove('shown')
  elCell.innerHTML = ''
}


function openModal(msg) {
  const elModal = document.querySelector('.modal')
  const elSpan = elModal.querySelector('.msg')
  elSpan.innerText = msg
  elModal.style.display = 'block'
}

function closeModal() {
  const elModal = document.querySelector('.modal')
  elModal.style.display = 'none'
}

function changeSize(elLevel) {
  if (elLevel.className === 'beginner') {
    gLevel.SIZE = 4
    gLevel.MINES = 2
    onInit()
  } else if (elLevel.className === 'medium') {
    gLevel.SIZE = 8
    gLevel.MINES = 14
    onInit()
  } else if (elLevel.className === 'expert') {
    gLevel.SIZE = 12
    gLevel.MINES = 32
    onInit()
  }
}


function renderCell(i, j) {
  if (gBoard[i][j].isMarked) return
  const elCell = document.querySelector(`.cell-${i}-${j}`)
  elCell.classList.add('shown')
  if (gBoard[i][j].isMine) {
    elCell.innerHTML = MINE_IMG
  } else if (gBoard[i][j].minesAroundCount === 0) return
  else elCell.innerHTML = gBoard[i][j].minesAroundCount
}


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